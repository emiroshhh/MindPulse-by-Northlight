# Environment Variables

Last updated: 2026-07-14. All values are server-side (Worker secrets in
production, `.dev.vars` / `.env.local` locally). Never prefix with
`NEXT_PUBLIC_`; never commit real values.

| Variable                  | Required             | Default            | Purpose                                                                                     |
| ------------------------- | -------------------- | ------------------ | ------------------------------------------------------------------------------------------- |
| `GEMINI_API_KEY`          | yes (for AI replies) | —                  | Google Gemini Interactions API key                                                          |
| `GEMINI_MODEL`            | no                   | `gemini-3.5-flash` | Gemini model override                                                                       |
| `SESSION_SECRET`          | yes (for auth)       | —                  | HMAC key for session-token hashing; ≥32 chars                                               |
| `AI_PROVIDER`             | no                   | `gemini`           | set to `deepseek` to switch providers                                                       |
| `DEEPSEEK_API_KEY`        | only if deepseek     | —                  | DeepSeek key                                                                                |
| `DEEPSEEK_MODEL`          | no                   | `deepseek-chat`    | DeepSeek model override                                                                     |
| `AUTH_DEBUG`              | no                   | unset              | set `true` to enable the boolean-only `/api/auth/debug` endpoint; leave unset in production |
| `AI_ENABLED`              | recommended          | `true`             | normal Worker variable; `false` disables provider calls while non-AI flows continue         |
| `AI_GLOBAL_DAILY_LIMIT`   | recommended          | unset              | normal Worker variable; aggregate D1 provider-request ceiling per UTC day                   |
| `AI_GLOBAL_MONTHLY_LIMIT` | recommended          | unset              | normal Worker variable; aggregate D1 provider-request ceiling per UTC month                 |
| `SITE_URL`                | recommended          | localhost          | normal Worker variable; canonical production HTTPS origin for metadata                      |

Bindings (from `apps/web/wrangler.jsonc`): `DB` → D1 database `mindpulse-db`
(migrations in `migrations/`), `ASSETS` → static assets.

Behavior without configuration (graceful degradation, verified):

- missing `GEMINI_API_KEY` → AI routes return coded 503 (`missing_key`);
  crisis screening still works (it never calls the provider); Recovery Mode
  returns its deterministic fallback plan.
- missing `SESSION_SECRET` → auth routes return coded 503; guest flows work.
- missing `DB` → account features return coded 503; guest-local flows work.

Set production secrets with:

```powershell
npx wrangler secret put GEMINI_API_KEY --config apps/web/wrangler.jsonc
npx wrangler secret put SESSION_SECRET --config apps/web/wrangler.jsonc
```

Apply migration `0007_ai_capacity.sql` before enabling global limits. Provider
failures and 429s refund the caller’s daily allowance and the reserved global
capacity. Recovery returns a deterministic plan when AI is unavailable.
