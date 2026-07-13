/**
 * Honest beta measurement. Events are aggregate daily counters only —
 * no user ids, no sessions, no per-user rows, no timelines beyond the day.
 * The point is to answer "is anyone completing the core flows?" without
 * building a tracking system.
 */
export const BETA_EVENTS = [
  'onboarding_completed',
  'next_action_set',
  'action_completed',
  'recovery_plan_created',
  'recovery_completed',
  'tool_result_saved',
  'feedback_submitted',
  'feedback_helped_yes',
  'feedback_helped_no',
  'returning_visit',
] as const;

export type BetaEvent = (typeof BETA_EVENTS)[number];

export function isBetaEvent(value: unknown): value is BetaEvent {
  return (
    typeof value === 'string' &&
    (BETA_EVENTS as readonly string[]).includes(value)
  );
}
