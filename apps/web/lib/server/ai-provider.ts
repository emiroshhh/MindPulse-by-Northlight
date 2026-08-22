import { getCloudflareContext } from '@opennextjs/cloudflare';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/interactions';
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';
const DEFAULT_DEEPSEEK_MODEL = 'deepseek-chat';
const PROVIDER_TIMEOUT_MS = 25_000;
const DEEPSEEK_MAX_TOKENS = 700;

type AiProviderName = 'gemini' | 'deepseek';

type AiRuntimeEnv = {
  AI_PROVIDER?: string | undefined;
  GEMINI_API_KEY?: string | undefined;
  GEMINI_MODEL?: string | undefined;
  DEEPSEEK_API_KEY?: string | undefined;
  DEEPSEEK_MODEL?: string | undefined;
};

type GenerateReplyOptions = {
  systemPrompt: string;
  interactionInput: string;
};

type GenerateReplyResult =
  | { ok: true; reply: string }
  | {
      ok: false;
      status: number;
      body:
        | { error: 'missing_key' }
        | { error: 'gemini_request_failed'; status: number }
        | { error: 'deepseek_request_failed'; status: number }
        | { error: 'gemini_empty_response' }
        | { error: 'deepseek_empty_response' }
        | { error: 'gemini_unavailable' }
        | { error: 'deepseek_unavailable' };
    };

export async function generateMindPulseReply({
  systemPrompt,
  interactionInput,
}: GenerateReplyOptions): Promise<GenerateReplyResult> {
  const env = await getAiRuntimeEnv();
  const provider = selectAiProvider(env.AI_PROVIDER);

  if (provider === 'deepseek') {
    return generateDeepSeekReply({ env, systemPrompt, interactionInput });
  }

  return generateGeminiReply({ env, systemPrompt, interactionInput });
}

export function selectAiProvider(value: string | undefined): AiProviderName {
  return value?.trim().toLowerCase() === 'deepseek' ? 'deepseek' : 'gemini';
}

async function getAiRuntimeEnv(): Promise<AiRuntimeEnv> {
  const processEnv: AiRuntimeEnv = {
    AI_PROVIDER: process.env.AI_PROVIDER,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL,
  };

  try {
    const { env } = await getCloudflareContext({ async: true });
    const bindings = env as AiRuntimeEnv;
    return {
      AI_PROVIDER: processEnv.AI_PROVIDER || bindings.AI_PROVIDER,
      GEMINI_API_KEY: processEnv.GEMINI_API_KEY || bindings.GEMINI_API_KEY,
      GEMINI_MODEL: processEnv.GEMINI_MODEL || bindings.GEMINI_MODEL,
      DEEPSEEK_API_KEY:
        processEnv.DEEPSEEK_API_KEY || bindings.DEEPSEEK_API_KEY,
      DEEPSEEK_MODEL: processEnv.DEEPSEEK_MODEL || bindings.DEEPSEEK_MODEL,
    };
  } catch {
    return processEnv;
  }
}

async function generateGeminiReply({
  env,
  systemPrompt,
  interactionInput,
}: GenerateReplyOptions & { env: AiRuntimeEnv }): Promise<GenerateReplyResult> {
  const key = env.GEMINI_API_KEY;
  const model = env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
  if (!key) return { ok: false, status: 503, body: { error: 'missing_key' } };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        model,
        store: false,
        system_instruction: systemPrompt,
        input: interactionInput,
        generation_config: {
          temperature: 0.5,
          max_output_tokens: 500,
          thinking_level: 'low',
        },
      }),
    });
    if (!response.ok) {
      console.error('[MindPulse] Gemini request failed:', {
        status: response.status,
      });
      return {
        ok: false,
        status: response.status === 429 ? 429 : 502,
        body: { error: 'gemini_request_failed', status: response.status },
      };
    }
    const reply = extractGeminiReply(await response.json());
    if (!reply)
      return {
        ok: false,
        status: response.status === 429 ? 429 : 502,
        body: { error: 'gemini_empty_response' },
      };
    return { ok: true, reply };
  } catch (error) {
    console.error('[MindPulse] Gemini unavailable:', {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
    return { ok: false, status: 502, body: { error: 'gemini_unavailable' } };
  } finally {
    clearTimeout(timeout);
  }
}

async function generateDeepSeekReply({
  env,
  systemPrompt,
  interactionInput,
}: GenerateReplyOptions & { env: AiRuntimeEnv }): Promise<GenerateReplyResult> {
  const key = env.DEEPSEEK_API_KEY;
  const model = env.DEEPSEEK_MODEL ?? DEFAULT_DEEPSEEK_MODEL;
  if (!key) return { ok: false, status: 503, body: { error: 'missing_key' } };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: interactionInput },
        ],
        temperature: 0.5,
        max_tokens: DEEPSEEK_MAX_TOKENS,
        stream: false,
      }),
    });
    if (!response.ok) {
      console.error('[MindPulse] DeepSeek request failed:', {
        status: response.status,
      });
      return {
        ok: false,
        status: 502,
        body: { error: 'deepseek_request_failed', status: response.status },
      };
    }
    const reply = extractDeepSeekReply(await response.json());
    if (!reply)
      return {
        ok: false,
        status: 502,
        body: { error: 'deepseek_empty_response' },
      };
    return { ok: true, reply };
  } catch (error) {
    console.error('[MindPulse] DeepSeek unavailable:', {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
    return { ok: false, status: 502, body: { error: 'deepseek_unavailable' } };
  } finally {
    clearTimeout(timeout);
  }
}

export function extractGeminiReply(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const body = value as Record<string, unknown>;
  if (typeof body.output_text === 'string') return body.output_text;
  if (typeof body.text === 'string') return body.text;

  const textFromContent = (content: unknown) =>
    Array.isArray(content)
      ? content
          .flatMap((part) =>
            part &&
            typeof part === 'object' &&
            typeof (part as Record<string, unknown>).text === 'string'
              ? [(part as Record<string, unknown>).text as string]
              : [],
          )
          .join('\n')
          .trim()
      : '';

  const textFromItems = (items: unknown) =>
    Array.isArray(items)
      ? items
          .flatMap((item) => {
            if (!item || typeof item !== 'object') return [];
            const record = item as Record<string, unknown>;
            if (typeof record.text === 'string') return [record.text];
            const text = textFromContent(record.content);
            return text ? [text] : [];
          })
          .join('\n')
          .trim()
      : '';

  const stepText = textFromItems(body.steps);
  if (stepText) return stepText;

  const outputs = Array.isArray(body.outputs)
    ? body.outputs
    : Array.isArray(body.output)
      ? body.output
      : [];
  const outputText = textFromItems(outputs);
  if (outputText) return outputText;
  const candidates = Array.isArray(body.candidates) ? body.candidates : [];
  return (
    candidates
      .flatMap((candidate) => {
        if (!candidate || typeof candidate !== 'object') return [];
        const content = (candidate as Record<string, unknown>).content;
        if (!content || typeof content !== 'object') return [];
        const text = textFromContent(
          (content as Record<string, unknown>).parts,
        );
        return text ? [text] : [];
      })
      .join('\n')
      .trim() || null
  );
}

export function extractDeepSeekReply(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const choices = (value as Record<string, unknown>).choices;
  if (!Array.isArray(choices)) return null;
  const first = choices[0];
  if (!first || typeof first !== 'object') return null;
  const message = (first as Record<string, unknown>).message;
  if (!message || typeof message !== 'object') return null;
  const content = (message as Record<string, unknown>).content;
  return typeof content === 'string' && content.trim() ? content.trim() : null;
}
