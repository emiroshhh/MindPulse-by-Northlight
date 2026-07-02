# MindPulse current beta audit

Audit refreshed: 2026-07-03. Scope: active Next.js/OpenNext web app on Cloudflare Workers, D1 persistence, Gemini chat route, public beta/portfolio pages, feedback flow, safety documentation, and Static Assets headers.

## Current architecture findings

| Area | Current state | Audit conclusion |
| --- | --- | --- |
| Production storage | Cloudflare D1 | Active auth, sessions, daily usage, account chat history, and Agent plans use D1. Supabase is legacy and unused by active web routes. |
| Guest access | Working | `/app` and six tools are guest-first. Guest state stays local; five daily AI messages are enforced server-side. |
| Accounts | Working | Accounts receive twenty daily messages and D1-backed chat/Agent history. Auth/session/logout code was not changed in this hardening pass. |
| AI transport | Buffered JSON | Gemini output is fully received and screened before the API returns JSON. There is no production SSE/token stream claim. |
| AI modes | Six distinct modes | Study, Planner, Motivation, Habits, Goals, and Reflection have distinct system guidance and bounded context. |
| Languages | EN/RU/KZ interface | UI localization exists in three languages. Deterministic safety coverage is primarily English/Russian; equivalent KZ crisis coverage is not claimed. |
| Feedback | External and optional | The configured external form opens in a new tab with `noreferrer`. MindPulse stores only a local opened marker and has no feedback database. |
| Metrics | Goals only | Impact numbers are explicitly beta targets/placeholders, not observed outcomes. |

## Stage 7.5 hardening results

### HTTP headers

`apps/web/public/_headers` now adds the following to Cloudflare Static Assets:

- HSTS;
- `X-Content-Type-Options: nosniff`;
- strict-origin referrer policy;
- restricted camera, microphone, geolocation, payment, and USB permissions;
- `X-Frame-Options: DENY`;
- a practical CSP with `frame-ancestors 'none'`, no objects or frames, same-origin scripts/connections, and narrowly required inline styles/scripts for the current Next.js output.

Cloudflare documents that `_headers` does not apply to Worker-generated SSR/API responses. Existing `next.config.ts` already applies nosniff, Referrer-Policy, and Permissions-Policy across Next routes. Extending CSP/HSTS/X-Frame parity to every Worker response is intentionally deferred because this pass forbids risky Worker/deployment-config changes.

### Logging hygiene

- User prompts and conversation history are not logged.
- Gemini error/response bodies are no longer logged.
- Provider exception messages are no longer logged.
- Safe status and error-name metadata remains.
- Existing auth diagnostics remain unchanged and sanitized.

### Privacy readiness

The public privacy page now explains guest storage, D1 account storage, daily usage counters, Gemini processing, optional feedback, beta retention, local deletion, account-data requests, and the current feedback-form contact channel.

### Public links

Automated tests verify the Case Study footer link, `/beta` → `/case-study`, feedback destination safety, and static internal links on the main public pages. No `href="#"` feedback destination remains.

## Outdated audit findings removed

The previous audit described an older mood/journal/Supabase application, instance-local rate limiting, OpenAI provider defaults, and SSE streaming. Those statements do not describe the active MindPulse beta and have been removed.

## Intentionally deferred

- Full runtime security-header parity for Worker-generated SSR/API responses
- Professional safety/privacy/legal review
- Reviewed Kazakh urgent-language rules and fixed safety response
- Self-service account deletion
- Formal automatic retention schedule and backup-deletion policy
- Advanced analytics, payments, ads, mood tracking, and journals

These items should be addressed only through separately scoped, reviewed work. They must not be presented as current production capabilities.
