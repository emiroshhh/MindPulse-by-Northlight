import {
  assessModelOutput,
  assessUserInput,
  buildFallbackRecoveryPlan,
  parseRecoveryPlanText,
  recoveryRequestSchema,
  type RecoveryPlan,
} from '@mindpulse/shared';
import {
  getAuthDb,
  getCurrentUserFromRequest,
  json,
  secureId,
} from '../../../lib/server/auth';
import { generateMindPulseReply } from '../../../lib/server/ai-provider';
import { crisisPayload } from '../../../lib/server/crisis';
import { recordEvent } from '../../../lib/server/events';
import {
  refundDailyUsage,
  reserveDailyUsage,
  reserveGlobalAiCapacity,
} from '../../../lib/server/usage';
import {
  recoveryRepairInstruction,
  buildRecoveryInput,
  buildRecoverySystemPrompt,
} from '../../../lib/server/recovery-prompt';

export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getCurrentUserFromRequest(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }
  const parsed = recoveryRequestSchema.safeParse(body);
  if (!parsed.success) return json({ error: 'invalid_request' }, 400);
  const recoveryRequest = parsed.data;

  // Deterministic safety screening before any generation, over everything
  // the student typed.
  const screenText = [
    recoveryRequest.missedContext,
    ...recoveryRequest.items.map((item) => item.title),
  ].join('\n');
  if (assessUserInput(screenText).flagged) {
    return json(crisisPayload(recoveryRequest.language, request));
  }

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

  const systemPrompt = buildRecoverySystemPrompt(recoveryRequest.language);
  const input = buildRecoveryInput(recoveryRequest);

  let plan: RecoveryPlan | null = null;
  let source: 'ai' | 'fallback' = 'ai';

  const first = await generateRecoveryReply(systemPrompt, input);
  if (first.ok && !assessModelOutput(first.reply).flagged) {
    const attempt = parseRecoveryPlanText(first.reply);
    if (attempt.ok) plan = attempt.plan;
  }

  // One repair retry, then a deterministic fallback. Provider being down
  // entirely also lands on the fallback — the student still gets a plan
  // built from their own items.
  if (!plan) {
    const second = await generateRecoveryReply(
      `${systemPrompt}\n\n${recoveryRepairInstruction(recoveryRequest.language)}`,
      input,
    );
    if (second.ok && !assessModelOutput(second.reply).flagged) {
      const attempt = parseRecoveryPlanText(second.reply);
      if (attempt.ok) plan = attempt.plan;
    }
  }

  if (!plan) {
    plan = buildFallbackRecoveryPlan(recoveryRequest);
    source = 'fallback';
    await refundDailyUsage({ request, user });
  }

  let saved: { id: string } | null = null;
  if (user) {
    try {
      const db = await getAuthDb();
      const now = new Date().toISOString();
      const id = secureId('agent');
      await db
        .prepare(
          `INSERT INTO agent_tasks (id, user_id, title, content, status, kind, data, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'saved', 'recovery', ?, ?, ?)`,
        )
        .bind(
          id,
          user.id,
          recoveryTitle(now, recoveryRequest.language),
          plan.immediateAction,
          JSON.stringify(plan),
          now,
          now,
        )
        .run();
      saved = { id };
    } catch (error) {
      console.error('[MindPulse] recovery save failed:', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
    }
  }

  try {
    await recordEvent(await getAuthDb(), 'recovery_plan_created');
  } catch {
    // Measurement never blocks the flow.
  }

  return json({ plan, source, usage, saved });
}

async function generateRecoveryReply(
  systemPrompt: string,
  interactionInput: string,
) {
  const capacity = await reserveGlobalAiCapacity();
  if (!capacity.allowed)
    return { ok: false as const, capacityUnavailable: true };
  const result = await generateMindPulseReply({
    systemPrompt,
    interactionInput,
  });
  try {
    await recordEvent(
      await getAuthDb(),
      result.ok ? 'ai_request_succeeded' : 'ai_request_failed',
    );
  } catch {
    // Analytics must not affect Recovery.
  }
  if (!result.ok) await capacity.release();
  return result;
}

function recoveryTitle(isoNow: string, language: string) {
  const title: Record<string, string> = {
    en: 'Recovery plan',
    ru: 'План восстановления',
    kk: 'Қалпына келу жоспары',
    es: 'Plan de recuperación',
  };
  return `${title[language] ?? title.en} · ${isoNow.slice(0, 10)}`;
}

function methodNotAllowed() {
  return Response.json(
    { error: 'method_not_allowed' },
    { status: 405, headers: { Allow: 'POST' } },
  );
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
