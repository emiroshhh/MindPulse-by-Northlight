# MindPulse Transformation Log (Fable 5 session, 2026-07-13)

Concise progress log for the beta/portfolio transformation. Newest entries at the bottom.

## Verified baseline (WP0)

- Branch `feature/mindpulse-platform-beta` @ `94b01a1`; production Worker `mindpulse` last deployed 2026-07-08 (same date as HEAD) → repo ≈ production.
- Checks: `lint` ✓, `typecheck` ✓, `test` ✓ (19 shared + 117 web), **`format:check` ✗ (pre-existing — ~30 committed files unformatted; would fail CI step 1)**. Fixed immediately with a mechanical `prettier --write` commit (`7828ff9`).
- No P0 security issues found: parameterized SQL throughout, no `dangerouslySetInnerHTML`, server-side ownership checks on all user-owned resources, no committed secrets, sanitized logging, provider bodies never leaked, docs honest (no fabricated metrics).
- Priority defects identified (full details in the session plan):
  - P1: English-only crisis reply ignoring user language + never surfacing crisis resources; no Kazakh crisis detection; feedback system is a stub (external URL, unconfigured, no API/table); `<html lang>` hardcoded `en`; no CSP/HSTS/frame protection on SSR/API responses; session token mirrored to localStorage; ungated `/api/auth/debug`; in-memory auth throttle; signup enumeration + login timing oracle.
  - P2: six tools are one chat with copy variations (no completion states); no Recovery Mode; cluttered dashboard without one primary action; no insights; no measurement; no account deletion; marketing pages English-only; dead mood-app component tree; stale `vercel.json`; incomplete `.env.example`.

## Priorities

WP1 crisis localization → WP2 security → WP3 feedback → WP4 events → WP5 Recovery Mode → WP6 tool distinctness → WP7 dashboard/onboarding → WP8 localization/lang → WP9 deletion+a11y+cleanup → WP10 docs/report. Each WP ends with format/lint/typecheck/test/build green.

## Major decisions

- Keep `packages/shared` legacy `Locale = en|ru` untouched; introduce `SafetyLocale = en|ru|kk` scoped to the safety module (avoids ripple through legacy mood/exercise types slated for deletion).
- Kazakh crisis text ships flagged `NEEDS NATIVE REVIEW` and is always shown together with Russian until native review; safety text must never be unreadable.
- Crisis resources keep `phone: null` (verification gate) — never invent numbers; the chat response links resources instead.
- Keep the localStorage session-token fallback (Phase 3.x cookie failures on Workers were real) but add cookie-first self-healing + CSP; document removal precondition.
- Recovery Mode is a guided form + zod-validated structured AI output with a deterministic non-AI fallback, persisted via `agent_tasks.kind/data` — not a renamed chat.
- Feedback table stores no user_id/IP/session; consent required but not stored. Events table stores aggregate daily counts only.

## Work log

- **WP0 (done)** — baseline recorded above; formatting debt fixed (`7828ff9`); this log created.
- **WP1 (done)** — localized crisis pipeline: structured `{reply, crisis, resources}` responses from /api/chat, per-language crisis replies (kk always paired with ru pending native review), region-aware resources via `cf-ipcountry` (no Kazakhstan assumption), Kazakh detection patterns flagged NEEDS NATIVE REVIEW, fixed a latent bug where `\b` next to Cyrillic made the Russian idiom guard dead, distinct `role="alert"` crisis block in ChatPanel. Tests: kk true-positives, ru/kk idiom false-positives.
- **WP2 (done)** — security hardening: `middleware.ts` adds CSP/HSTS/X-Frame-Options/nosniff/referrer/permissions to all Worker-rendered responses (static assets keep `_headers`); `/api/auth/debug` gated behind `AUTH_DEBUG`; signup duplicate-email response neutralized + password hashed before existence check; login does dummy-hash verify for unknown users (timing); durable D1 rate limiting (`rate_limits` table, migration 0003) with in-memory fallback, keys hashed (no raw IPs in D1); cookie-first self-healing removes the localStorage fallback token when cookies work (kept-but-hardened decision documented).
- **WP3 (done)** — real feedback system: migration 0004 `feedback` table (no user_id/IP/session; flow/helped/confusing/expectation/suggestion≤500/locale/device category/timestamp; consent required but not stored), POST /api/feedback with zod validation + durable 5/day limit, fully localized in-app modal form with focus trap/Escape/focus restore replacing the unconfigured external-URL stub (`NEXT_PUBLIC_FEEDBACK_URL` removed).
- **WP4 (done)** — honest measurement: migration 0005 `events` aggregate table (name, day, count — no per-user rows), `recordEvent` server helper, allowlisted POST /api/events for client events with daily cap, `returning_visit` once-a-day client guard. No public display; queries documented in the beta guide.
- **WP5 (done)** — Recovery Mode: /recovery three-step guided form → POST /api/recovery (safety screen → quota → AI constrained to zod-validated JSON with one repair retry → deterministic fallback plan built only from the user's own items), urgent/optional/postponed split + one 10-minute immediate action, persistence via `agent_tasks.kind/data` (migration 0006) for accounts and localStorage for guests, completion states wired to `recovery_plan_created`/`recovery_completed` events, PATCH /api/agent with ownership enforced in the WHERE clause. Shared usage/crisis helpers extracted (`lib/server/usage.ts`, `lib/server/crisis.ts`).
- **WP6 (done)** — tool distinctness: per-tool guided intake fields (localized ×3) composing a structured first message, save-result completion state (accounts → `agent_tasks kind='tool_result'`, guests → localStorage), `aria-live` log region for chat, `vitest.config.ts` with tsconfig aliases enabling component tests.
- **WP7 (done)** — dashboard rebuilt around ONE next action: quick-start (pick need → one real task → smallest useful step) with accept/done cycle wired to onboarding/action events; honest InsightsCard (real counts only, real empty state); Recovery entry card; cut hero/feature-cards/next-actions-trio/beta-journey/retention/"Recent sessions" placeholder sections (~10 → 5 sections). Landing page made honest and guest-first: CTA → /app without signup, fictional product mock replaced with a labeled example, how-it-works matches the real flow. New GET /api/insights.
- **WP8 (done)** — localization: landing fully localized en/ru/kk (typed marketing-i18n), `<html lang>` synced to selection everywhere (was hardcoded en), Kazakh labeled beta in the picker, localized English-only notices on /why /impact /case-study /privacy /beta, automated i18n-completeness test (empty-string walk, key parity, differs-from-English, tool intake parity).
- **WP9 (done)** — account deletion (password-confirmed POST /api/auth/delete-account with ordered deletes + cookie clearing + accessible dialog); deleted the orphaned mood-app tree (8 components + 2 tests + ui.tsx + /style); removed stale vercel.json and dev:mobile; README Node 22. All gates green: lint, typecheck, 221 tests, production build.

## Test results snapshot (after WP9)

`format:check` ✓ · `lint` ✓ · `typecheck` ✓ · `test` ✓ (42 shared + 179 web = 221) · `build` (OpenNext) ✓

## Unresolved blockers

- Kazakh safety patterns, crisis reply, and marketing copy still need native-speaker review (flagged in code).
- Nonce-based CSP not implemented ('unsafe-inline' script-src accepted; documented limitation).
- localStorage session-token fallback retained deliberately (Workers cookie reliability); removal precondition documented.
- KZ crisis resource entry still `verification_required` (no phone number by design until human verification).
