# MindPulse Beta Guide

Last updated: 2026-07-14. Tester-facing journey lives at `/beta`; this file is
for whoever runs the beta.

## What we are trying to learn

Whether a student can turn one real task into a manageable next action, and
whether Recovery Mode actually helps after missed days. Nothing else matters
yet.

## Measurement (aggregate-only, no per-user tracking)

Counters land in the D1 `events` table as (name, day, count):

| Event                                                               | Fired when                                           |
| ------------------------------------------------------------------- | ---------------------------------------------------- |
| `onboarding_completed`                                              | first time a visitor accepts a suggested next action |
| `next_action_set`                                                   | a suggested next action is accepted                  |
| `action_completed`                                                  | the current next action is marked Done               |
| `recovery_plan_created`                                             | /api/recovery returns a plan (AI or fallback)        |
| `recovery_completed`                                                | a recovery plan is marked done (server or client)    |
| `tool_result_saved`                                                 | a tool result is saved to an account                 |
| `tool_started` / `tool_completed`                                   | a tool request starts / returns a valid answer       |
| `ai_request_succeeded` / `ai_request_failed`                        | provider request outcome                             |
| `feedback_submitted` / `feedback_helped_yes` / `feedback_helped_no` | feedback form                                        |
| `returning_visit`                                                   | first dashboard visit of a day per device            |

Useful queries (run with Wrangler against `mindpulse-db`):

```sql
-- Core funnel, by day
SELECT day, name, count FROM events ORDER BY day DESC, name;

-- Did the product help? (feedback)
SELECT flow, helped, COUNT(*) FROM feedback GROUP BY flow, helped;

-- Recovery follow-through
SELECT
  SUM(CASE WHEN name='recovery_plan_created' THEN count ELSE 0 END) AS created,
  SUM(CASE WHEN name='recovery_completed' THEN count ELSE 0 END)    AS completed
FROM events;
```

```powershell
npx wrangler d1 execute mindpulse-db --remote --config apps/web/wrangler.jsonc `
  --command "SELECT day, name, count FROM events ORDER BY day DESC LIMIT 50"
```

## Rules

- Do **not** publish any number until real testers produce it; `/impact` lists
  goals, clearly labeled as goals.
- Feedback rows are anonymous by design — never try to join them to accounts.
- Crisis-flagged content is never stored or counted anywhere.
- AI outcome counters are aggregate-only and never include prompts, answers,
  identities, IP addresses, or campaign attribution.

## Suggested tester script

1. Open `/` → "Try it now — no login needed".
2. Quick start: pick a need, describe one real task, accept or reject the
   suggested action.
3. Open one tool, use the guided intake, save the result.
4. Open `/recovery` with a real missed-work situation; complete the first
   step.
5. Switch language (ru/kk) and repeat one flow.
6. Send feedback (one minute, anonymous).
