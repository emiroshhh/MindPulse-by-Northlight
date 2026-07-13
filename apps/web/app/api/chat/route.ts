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
import { reserveDailyUsage } from '../../../lib/server/usage';
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
const LANGUAGES = ['en', 'ru', 'kk'] as const;
type Language = (typeof LANGUAGES)[number];

export async function POST(request: Request) {
  const user = await getCurrentUserFromRequest(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  if (!body || typeof body !== 'object')
    return json({ error: 'Message is required' }, 400);
  const raw = body as Record<string, unknown>;
  const message = typeof raw.message === 'string' ? raw.message.trim() : '';
  if (!message) return json({ error: 'Message is required' }, 400);
  if (message.length > 1000)
    return json({ error: 'Message must be 1,000 characters or fewer' }, 400);
  const mode: Mode =
    typeof raw.mode === 'string' && MODES.includes(raw.mode as Mode)
      ? (raw.mode as Mode)
      : 'study';
  const language: Language =
    typeof raw.language === 'string' &&
    LANGUAGES.includes(raw.language as Language)
      ? (raw.language as Language)
      : 'en';

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

  const aiResult = await generateMindPulseReply({
    systemPrompt: buildSystemPrompt(mode, language),
    interactionInput: buildInteractionInput(message, raw.history),
  });
  if (!aiResult.ok) return json(aiResult.body, aiResult.status);

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
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function methodNotAllowed() {
  return Response.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'POST' } },
  );
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
