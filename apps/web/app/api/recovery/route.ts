import {
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
import { reserveDailyUsage } from '../../../lib/server/usage';
import {
  RECOVERY_REPAIR_INSTRUCTION,
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

  const first = await generateMindPulseReply({
    systemPrompt,
    interactionInput: input,
  });
  if (first.ok) {
    const attempt = parseRecoveryPlanText(first.reply);
    if (attempt.ok) plan = attempt.plan;
  }

  // One repair retry, then a deterministic fallback. Provider being down
  // entirely also lands on the fallback — the student still gets a plan
  // built from their own items.
  if (!plan) {
    const second = await generateMindPulseReply({
      systemPrompt: `${systemPrompt}\n\n${RECOVERY_REPAIR_INSTRUCTION}`,
      interactionInput: input,
    });
    if (second.ok) {
      const attempt = parseRecoveryPlanText(second.reply);
      if (attempt.ok) plan = attempt.plan;
    }
  }

  if (!plan) {
    plan = buildFallbackRecoveryPlan(recoveryRequest);
    source = 'fallback';
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
          recoveryTitle(now),
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

function recoveryTitle(isoNow: string) {
  return `Recovery plan · ${isoNow.slice(0, 10)}`;
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
