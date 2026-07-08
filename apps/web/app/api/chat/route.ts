import { assessModelOutput, assessUserInput } from '@mindpulse/shared';
import {
  getAuthDb,
  getCurrentUserFromRequest,
  json,
  type AuthUser,
} from '../../../lib/server/auth';
import { generateMindPulseReply } from '../../../lib/server/ai-provider';
import {
  buildInteractionInput,
  buildSystemPrompt,
} from '../../../lib/server/mindpulse-prompt';

export const maxDuration = 30;

const GUEST_DAILY_LIMIT = 5;
const ACCOUNT_DAILY_LIMIT = 20;
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

const CRISIS_REPLY =
  'I am glad you reached out. You may need immediate real-world support, and MindPulse is not an emergency service. Please contact local emergency services now or tell a trusted person nearby and stay with someone safe. You do not have to handle this alone.';
const SAFE_FALLBACK =
  'I cannot provide that answer safely. I can still help you make a safe study plan, break down a goal, or find a trusted person to support you.';

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

  const inputSafety = assessUserInput(message);
  if (inputSafety.flagged) return json({ reply: CRISIS_REPLY });

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
    ? SAFE_FALLBACK
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

async function reserveDailyUsage({
  request,
  user,
}: {
  request: Request;
  user: AuthUser | null;
}) {
  const db = await getAuthDb();
  const usageDate = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  const limit = user ? ACCOUNT_DAILY_LIMIT : GUEST_DAILY_LIMIT;
  const accountRequired = !user;
  const guestKey = user ? null : await guestUsageKey(request);
  const id = user
    ? `user:${user.id}:${usageDate}`
    : `guest:${guestKey}:${usageDate}`;

  const result = await db
    .prepare(
      `INSERT INTO daily_usage (
        id, user_id, guest_key, usage_date, message_count, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, 1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        message_count = message_count + 1,
        updated_at = excluded.updated_at
      WHERE daily_usage.message_count < ?`,
    )
    .bind(id, user?.id ?? null, guestKey, usageDate, now, now, limit)
    .run();
  const changes =
    (result as { meta?: { changes?: number } }).meta?.changes ?? 1;
  const row = await db
    .prepare('SELECT message_count FROM daily_usage WHERE id = ? LIMIT 1')
    .bind(id)
    .first<{ message_count: number }>();
  const used = Number(row?.message_count ?? limit);
  const allowed = changes > 0 && used <= limit;
  return {
    allowed,
    limit,
    used: Math.min(used, limit),
    remaining: Math.max(limit - used, 0),
    accountRequired,
  };
}

async function guestUsageKey(request: Request) {
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown-ip';
  const userAgent = request.headers.get('user-agent') ?? 'unknown-agent';
  const bytes = new TextEncoder().encode(`${ip}|${userAgent}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return base64Url(new Uint8Array(digest));
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

function base64Url(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
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
