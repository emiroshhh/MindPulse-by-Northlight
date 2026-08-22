import {
  assessModelOutput,
  assessUserInput,
  safeOutputFallbacksFor,
} from '@mindpulse/shared';
import {
  getAuthDb,
  getCurrentUserFromRequest,
  json,
} from '../../../lib/server/auth';
import { generateMindPulseReply } from '../../../lib/server/ai-provider';
import { crisisPayload } from '../../../lib/server/crisis';
import {
  refundDailyUsage,
  reserveDailyUsage,
  reserveGlobalAiCapacity,
} from '../../../lib/server/usage';
import { recordEvent } from '../../../lib/server/events';
import {
  buildInteractionInput,
  buildSystemPrompt,
} from '../../../lib/server/mindpulse-prompt';

export const maxDuration = 30;

const MODES = [
  'study',
  'planner',
  'motivation',
  'habit',
  'goal',
  'reflection',
] as const;
type Mode = (typeof MODES)[number];
const LANGUAGES = ['en', 'ru', 'kk', 'es'] as const;
type Language = (typeof LANGUAGES)[number];
const ERROR_COPY: Record<
  Language,
  { invalid: string; required: string; tooLong: string; method: string }
> = {
  en: {
    invalid: 'Invalid request',
    required: 'Message is required',
    tooLong: 'Message must be 1,000 characters or fewer',
    method: 'Method not allowed',
  },
  ru: {
    invalid: 'Некорректный запрос',
    required: 'Введите сообщение',
    tooLong: 'Сообщение должно содержать не более 1 000 символов',
    method: 'Метод не поддерживается',
  },
  kk: {
    invalid: 'Сұрау жарамсыз',
    required: 'Хабарлама енгізіңіз',
    tooLong: 'Хабарлама 1 000 таңбадан аспауы керек',
    method: 'Әдіске рұқсат етілмейді',
  },
  es: {
    invalid: 'La solicitud no es válida',
    required: 'El mensaje es obligatorio',
    tooLong: 'El mensaje debe tener 1.000 caracteres o menos',
    method: 'Método no permitido',
  },
};

function requestLanguage(request: Request, raw?: Record<string, unknown>) {
  if (
    typeof raw?.language === 'string' &&
    LANGUAGES.includes(raw.language as Language)
  )
    return raw.language as Language;
  const preferred = request.headers
    .get('accept-language')
    ?.toLowerCase()
    .split(',')[0]
    ?.split('-')[0];
  return LANGUAGES.includes(preferred as Language)
    ? (preferred as Language)
    : 'en';
}

export async function POST(request: Request) {
  const user = await getCurrentUserFromRequest(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: ERROR_COPY[requestLanguage(request)].invalid }, 400);
  }
  if (!body || typeof body !== 'object')
    return json({ error: ERROR_COPY[requestLanguage(request)].invalid }, 400);
  const raw = body as Record<string, unknown>;
  const language = requestLanguage(request, raw);
  const errorCopy = ERROR_COPY[language];
  const message = typeof raw.message === 'string' ? raw.message.trim() : '';
  if (!message) return json({ error: errorCopy.required }, 400);
  if (message.length > 1000) return json({ error: errorCopy.tooLong }, 400);
  const mode: Mode =
    typeof raw.mode === 'string' && MODES.includes(raw.mode as Mode)
      ? (raw.mode as Mode)
      : 'study';

  // Crisis responses bypass generation entirely and never consume quota.
  const inputSafety = assessUserInput(message);
  if (inputSafety.flagged) return json(crisisPayload(language, request));

  const usage = await reserveDailyUsage({ request, user });
  if (!usage.allowed) {
    return json(
      {
        error: 'daily_limit_reached',
        limit: usage.limit,
        accountRequired: usage.accountRequired,
        remaining: 0,
      },
      429,
    );
  }

  const capacity = await reserveGlobalAiCapacity();
  if (!capacity.allowed) {
    await refundDailyUsage({ request, user });
    return json({ error: capacity.reason }, 429);
  }
  const aiResult = await generateMindPulseReply({
    systemPrompt: buildSystemPrompt(mode, language),
    interactionInput: buildInteractionInput(message, raw.history),
  });
  if (!aiResult.ok) {
    await capacity.release();
    await refundDailyUsage({ request, user });
    try {
      await recordEvent(await getAuthDb(), 'ai_request_failed');
    } catch {}
    return json(aiResult.body, aiResult.status);
  }
  try {
    await recordEvent(await getAuthDb(), 'ai_request_succeeded');
  } catch {}

  const safeReply = assessModelOutput(aiResult.reply).flagged
    ? safeOutputFallbacksFor(language).join('\n\n')
    : aiResult.reply;
  if (user) {
    await saveChatExchange({
      userId: user.id,
      message,
      reply: safeReply,
      mode,
    });
  }
  return json({ reply: safeReply, usage });
}

async function saveChatExchange({
  userId,
  message,
  reply,
  mode,
}: {
  userId: string;
  message: string;
  reply: string;
  mode: Mode;
}) {
  try {
    const db = await getAuthDb();
    const now = new Date().toISOString();
    await db
      .prepare(
        `INSERT INTO chat_messages (id, user_id, role, content, mode, created_at)
         VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        chatId(),
        userId,
        'user',
        message,
        mode,
        now,
        chatId(),
        userId,
        'assistant',
        reply,
        mode,
        now,
      )
      .run();
  } catch (error) {
    console.error('[MindPulse] chat history save failed:', {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
  }
}

function chatId() {
  return crypto.randomUUID();
}

function methodNotAllowed(request: Request) {
  return Response.json(
    { error: ERROR_COPY[requestLanguage(request)].method },
    { status: 405, headers: { Allow: 'POST' } },
  );
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
