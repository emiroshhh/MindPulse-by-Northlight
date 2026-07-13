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
