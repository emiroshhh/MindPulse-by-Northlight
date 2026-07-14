# MindPulse Privacy (engineering notes)

Last updated: 2026-07-14. The user-facing plain-language version is `/privacy`
in the app; this file documents the implementation behind each claim.

## What is collected, and why

| Data                                                           | Where                              | Why                           | Notes                                                                                                                                                                             |
| -------------------------------------------------------------- | ---------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guest chat history, saved plans/results, next action, language | localStorage only                  | product function              | never uploaded; cleared with browser storage                                                                                                                                      |
| Account email, PBKDF2 password hash, name                      | D1 `users`                         | login                         | hash format `pbkdf2-sha256$100000$salt$hash`                                                                                                                                      |
| Session token hash                                             | D1 `sessions`                      | session validation            | HMAC-SHA-256 keyed by `SESSION_SECRET`; raw token never stored                                                                                                                    |
| Account chat history, saved plans/results/recovery plans       | D1 `chat_messages` / `agent_tasks` | account sync                  | owner-scoped queries                                                                                                                                                              |
| Daily message counts                                           | D1 `daily_usage`                   | fair-use limits               | guest key = SHA-256(ip\|user-agent), not reversible to an IP                                                                                                                      |
| Rate-limit counters                                            | D1 `rate_limits`                   | brute-force protection        | keys are SHA-256 hashes; raw IPs never stored                                                                                                                                     |
| Feedback                                                       | D1 `feedback`                      | product improvement           | flow, three yes/no answers, optional suggestion ≤500 chars, locale, device category, timestamp — **no user id, session, IP, or email**; consent required to submit but not stored |
| Beta counters                                                  | D1 `events`                        | honest usefulness measurement | aggregate (name, day, count) only                                                                                                                                                 |

## What is deliberately not collected

Journal text, mood data, full prompts in logs, crisis message content,
passwords in any log, session tokens in any log, raw provider response bodies,
third-party analytics of any kind.

## Logging rules

Server logs contain only coded error names/statuses. Login/signup error
messages are sanitized (emails, `pbkdf2-*` strings, and 32+ char tokens are
redacted). AI-layer logs contain status codes and boolean "key configured"
flags only. Enforced by tests.

## Providers

Messages sent to AI tools pass through the Worker to Google Gemini (or
DeepSeek when `AI_PROVIDER=deepseek`). Gemini calls set `store: false`.
Infrastructure: Cloudflare Workers + D1.

## Retention and deletion

- Guest data: on the device until browser storage is cleared.
- Account data: retained during the beta; **self-service deletion** at the
  dashboard Account section → `POST /api/auth/delete-account` (password
  re-verification, explicit deletes across all user-owned tables, session
  cookies cleared). No fixed automatic retention period is promised yet, and
  the privacy page says so.
- Feedback and event rows are not linkable to a person and are kept for
  product analysis.

## Caching and headers

All API JSON responses set `Cache-Control: no-store`. Worker responses carry
CSP, HSTS, `X-Frame-Options: DENY`, nosniff, referrer and permissions policies
via `apps/web/middleware.ts`; static assets get the same set from
`apps/web/public/_headers`.
