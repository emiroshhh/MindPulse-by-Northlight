import { getCloudflareContext } from '@opennextjs/cloudflare';
import { assessModelOutput, assessUserInput } from '@mindpulse/shared';
import { getAuthDb, getCurrentUser, json } from '../../../lib/server/auth';

export const maxDuration = 30;

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/interactions';
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

const MODE_PROMPTS: Record<Mode, string> = {
  study:
    'Explain the topic in simple language. Give a concrete example, a short summary, and, when useful, three practice questions.',
  planner:
    'Create a realistic plan. Ask about or reasonably infer available time, use time blocks and breaks, and mark one priority task.',
  motivation:
    'Be grounded and supportive without toxic positivity. Give a short reset and one action the student can begin within five minutes.',
  habit:
    'Identify the habit, make it easier, suggest one small daily action, and offer a simple tracking method.',
  goal: 'Clarify the goal, create milestones, list the next three actions, and suggest a realistic timeline.',
  reflection:
    'Help the student notice what went well, what was hard, one lesson, and one improvement for tomorrow.',
};

const LANGUAGE_PROMPTS: Record<Language, string> = {
  en: 'Respond in English unless the student clearly asks for another language.',
  ru: 'Отвечай на русском языке, если студент явно не просит другой язык.',
  kk: 'Қазақ тілінде жауап бер, егер оқушы басқа тілді нақты сұрамаса.',
};

const SYSTEM_PROMPT = `You are MindPulse, an AI study and self-growth assistant for students.
Help with studying, planning, motivation, discipline, habits, productivity, goal breakdown, and reflection.
Use friendly, clear, structured language. Give practical steps and avoid filler.
Never claim to be a doctor or therapist, diagnose a mental health condition, or replace real-world support.
If the user mentions self-harm, suicide, danger, abuse, or an immediate crisis, tell them to contact local emergency services or a trusted person immediately.`;

const CRISIS_REPLY =
  'I am glad you reached out. You may need immediate real-world support, and MindPulse is not an emergency service. Please contact local emergency services now or tell a trusted person nearby and stay with someone safe. You do not have to handle this alone.';
const SAFE_FALLBACK =
  'I cannot provide that answer safely. I can still help you make a safe study plan, break down a goal, or find a trusted person to support you.';

async function geminiConfig() {
  if (process.env.GEMINI_API_KEY)
    return {
      key: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL ?? 'gemini-3.5-flash',
    };
  try {
    const { env } = await getCloudflareContext({ async: true });
    const bindings = env as CloudflareEnv & {
      GEMINI_API_KEY?: string;
      GEMINI_MODEL?: string;
    };
    return {
      key: bindings.GEMINI_API_KEY,
      model: bindings.GEMINI_MODEL ?? 'gemini-3.5-flash',
    };
  } catch {
    return {
      key: undefined,
      model: process.env.GEMINI_MODEL ?? 'gemini-3.5-flash',
    };
  }
}

function extractReply(value: unknown): string | null {
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

export async function POST(request: Request) {
  const user = await getCurrentUser();

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

  const { key, model } = await geminiConfig();
  console.info('[MindPulse] GEMINI_API_KEY configured:', Boolean(key));
  if (!key) return json({ error: 'missing_key' }, 503);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        model,
        store: false,
        system_instruction: `${SYSTEM_PROMPT}\n\nSelected mode: ${mode}. ${MODE_PROMPTS[mode]}\n\nLanguage: ${LANGUAGE_PROMPTS[language]}`,
        input: message,
        generation_config: { temperature: 0.7 },
      }),
    });
    console.info('[MindPulse] Gemini response status:', response.status);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[MindPulse] Gemini request failed:', {
        status: response.status,
        body: errorBody,
      });
      return json(
        { error: 'gemini_request_failed', status: response.status },
        502,
      );
    }
    const reply = extractReply(await response.json());
    if (!reply) return json({ error: 'gemini_empty_response' }, 502);
    const safeReply = assessModelOutput(reply).flagged ? SAFE_FALLBACK : reply;
    if (user) {
      await saveChatExchange({
        userId: user.id,
        message,
        reply: safeReply,
        mode,
      });
    }
    return json({ reply: safeReply });
  } catch (error) {
    console.error('[MindPulse] Gemini unavailable:', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return json({ error: 'gemini_unavailable' }, 502);
  } finally {
    clearTimeout(timeout);
  }
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
