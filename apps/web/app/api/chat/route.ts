import {
  MINDPULSE_SYSTEM_PROMPT,
  SAFE_CRISIS_REPLY,
  SAFE_OUTPUT_FALLBACK,
  assessModelOutput,
  assessUserInput,
  chatRequestSchema,
  getAIProvider,
  type Locale,
  type ProviderConfig,
  type ProviderName,
} from '@mindpulse/shared';

export const runtime = 'edge';
export const maxDuration = 30;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 8;
const buckets = new Map<string, number[]>();

interface SelectedProvider {
  name: ProviderName;
  mode: 'live' | 'demo';
  apiKey?: string;
  model?: string;
}

function liveProvider(
  name: 'openai' | 'anthropic',
  apiKey: string,
  model: string | undefined,
): SelectedProvider {
  return { name, mode: 'live', apiKey, ...(model ? { model } : {}) };
}

function selectProvider(): SelectedProvider | null {
  const requested = (process.env.AI_PROVIDER ?? 'auto').toLowerCase();
  const demoAllowed =
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_DEMO_AI === 'true';

  if (requested === 'mock') return { name: 'mock', mode: 'demo' };
  if (requested === 'anthropic' && process.env.ANTHROPIC_API_KEY)
    return liveProvider(
      'anthropic',
      process.env.ANTHROPIC_API_KEY,
      process.env.ANTHROPIC_MODEL,
    );
  if (requested === 'openai' && process.env.OPENAI_API_KEY)
    return liveProvider(
      'openai',
      process.env.OPENAI_API_KEY,
      process.env.OPENAI_MODEL,
    );
  if (requested === 'auto') {
    if (process.env.OPENAI_API_KEY)
      return liveProvider(
        'openai',
        process.env.OPENAI_API_KEY,
        process.env.OPENAI_MODEL,
      );
    if (process.env.ANTHROPIC_API_KEY)
      return liveProvider(
        'anthropic',
        process.env.ANTHROPIC_API_KEY,
        process.env.ANTHROPIC_MODEL,
      );
  }
  return demoAllowed ? { name: 'mock', mode: 'demo' } : null;
}

function groundedContext(
  context:
    | {
        enabled: boolean;
        recentMoods: Array<{ mood: string; intensity: number; tags: string[] }>;
      }
    | undefined,
  locale: Locale,
) {
  if (!context?.enabled || !context.recentMoods.length) return '';
  const summary = context.recentMoods
    .slice(0, 5)
    .map(
      (entry) =>
        `${entry.mood} (${entry.intensity}/5)${entry.tags.length ? `, tags: ${entry.tags.join(', ')}` : ''}`,
    )
    .join('; ');
  return `\nThe user explicitly opted in to sharing this minimal recent mood context: ${summary}. Refer to it only when directly relevant, gently, and without claiming a diagnosis or hidden pattern. Do not mention data collection. ${locale === 'ru' ? 'Use natural Russian.' : ''}`;
}

function corsHeaders(request: Request) {
  const origin = request.headers.get('origin') ?? '';
  const allowed = (
    process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000,http://localhost:8081'
  ).split(',');
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin)
      ? origin
      : (allowed[0] ?? 'http://localhost:3000'),
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

export function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

async function requestIdentity(request: Request, sessionId: string) {
  const bearer = request.headers
    .get('authorization')
    ?.replace(/^Bearer\s+/i, '');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (bearer && supabaseUrl && anonKey) {
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: { Authorization: `Bearer ${bearer}`, apikey: anonKey },
      });
      if (response.ok) {
        const user = (await response.json()) as { id?: string };
        if (user.id) return `user:${user.id}`;
      }
    } catch {
      /* fall through to anonymous identity */
    }
  }
  const forwarded =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const source = new TextEncoder().encode(`${forwarded}:${sessionId}`);
  const hash = await crypto.subtle.digest('SHA-256', source);
  return `anon:${Array.from(new Uint8Array(hash))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`;
}

function allowRequest(key: string) {
  const now = Date.now();
  const fresh = (buckets.get(key) ?? []).filter(
    (time) => now - time < WINDOW_MS,
  );
  if (fresh.length >= MAX_REQUESTS) return false;
  fresh.push(now);
  buckets.set(key, fresh);
  if (buckets.size > 1000) {
    for (const [bucketKey, times] of buckets)
      if (!times.some((time) => now - time < WINDOW_MS))
        buckets.delete(bucketKey);
  }
  return true;
}

function sseResponse(
  request: Request,
  text: string,
  metadata: Record<string, unknown>,
) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(`event: meta\ndata: ${JSON.stringify(metadata)}\n\n`),
      );
      for (const part of text.split(/(?<=\s)/)) {
        controller.enqueue(
          encoder.encode(
            `event: token\ndata: ${JSON.stringify({ token: part })}\n\n`,
          ),
        );
      }
      controller.enqueue(encoder.encode('event: done\ndata: {}\n\n'));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: corsHeaders(request) },
    );
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success)
    return Response.json(
      { error: 'Invalid request', issues: parsed.error.flatten().fieldErrors },
      { status: 400, headers: corsHeaders(request) },
    );

  const { message, sessionId, locale, history, context } = parsed.data;
  const identity = await requestIdentity(request, sessionId);
  if (!allowRequest(identity))
    return Response.json(
      {
        code: 'RATE_LIMITED',
        error:
          locale === 'ru'
            ? 'Сообщений было много. Сделай небольшую паузу и попробуй позже.'
            : 'There have been several messages. Take a short pause and try again soon.',
        retryAfterSeconds: 600,
      },
      {
        status: 429,
        headers: { ...corsHeaders(request), 'Retry-After': '600' },
      },
    );

  const inputAssessment = assessUserInput(message);
  if (inputAssessment.flagged) {
    return sseResponse(request, SAFE_CRISIS_REPLY[locale], {
      crisis: true,
      safetyLevel: inputAssessment.level,
      categories: inputAssessment.categories,
    });
  }

  const selectedProvider = selectProvider();
  if (!selectedProvider)
    return Response.json(
      {
        code: 'AI_NOT_CONFIGURED',
        error:
          locale === 'ru'
            ? 'Собеседник пока не настроен. Нужен серверный ключ AI-провайдера.'
            : 'The companion is not configured yet. A server-side AI provider key is required.',
      },
      { status: 503, headers: corsHeaders(request) },
    );

  const maxTokens = Math.min(Number(process.env.AI_MAX_TOKENS ?? 500), 700);
  const timeoutMs = Math.min(
    Math.max(Number(process.env.AI_TIMEOUT_MS ?? 20_000), 5_000),
    25_000,
  );
  const providerController = new AbortController();
  let timedOut = false;
  const abortProvider = () => providerController.abort();
  request.signal.addEventListener('abort', abortProvider, { once: true });
  const timeout = setTimeout(() => {
    timedOut = true;
    providerController.abort();
  }, timeoutMs);
  const config: ProviderConfig = {
    provider: selectedProvider.name,
    maxTokens,
    systemPrompt: `${MINDPULSE_SYSTEM_PROMPT}\nRespond in ${locale === 'ru' ? 'Russian' : 'English'}.${groundedContext(context, locale)}`,
    signal: providerController.signal,
  };
  if (selectedProvider.apiKey) config.apiKey = selectedProvider.apiKey;
  if (selectedProvider.model) config.model = selectedProvider.model;

  try {
    let generated = '';
    const provider = getAIProvider(selectedProvider.name);
    for await (const token of provider.stream(
      [...history, { role: 'user', content: message }],
      config,
    ))
      generated += token;
    if (!generated.trim())
      throw new Error('Provider returned an empty response');
    const outputAssessment = assessModelOutput(generated);
    const safeText = outputAssessment.flagged
      ? SAFE_OUTPUT_FALLBACK[locale as Locale]
      : generated;
    return sseResponse(request, safeText, {
      crisis: false,
      safetyFiltered: outputAssessment.flagged,
      providerMode: selectedProvider.mode,
    });
  } catch {
    return Response.json(
      {
        code: timedOut ? 'AI_TIMEOUT' : 'AI_PROVIDER_ERROR',
        error: timedOut
          ? locale === 'ru'
            ? 'Ответ занял слишком много времени. Попробуй отправить ещё раз.'
            : 'The response took too long. Please try sending it again.'
          : locale === 'ru'
            ? 'Собеседник временно недоступен. Твоё сообщение сохранено — можно повторить попытку.'
            : 'The companion is temporarily unavailable. Your message is saved—you can retry.',
      },
      {
        status: timedOut ? 504 : 502,
        headers: corsHeaders(request),
      },
    );
  } finally {
    clearTimeout(timeout);
    request.signal.removeEventListener('abort', abortProvider);
  }
}
