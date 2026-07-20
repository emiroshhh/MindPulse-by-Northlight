# Known Limitations

Last updated: 2026-07-14. Honest list — these are real, current constraints.

## Safety / localization

- **Kazakh is beta.** All kk strings and crisis patterns were written without
  native review (flagged `NEEDS NATIVE REVIEW` in code). Mitigation: kk crisis
  text always ships together with Russian; picker labels kk as beta.
- The KZ crisis resource entry is `verification_required`: it links to the
  official gov.kz directory but carries no phone number until a human verifies
  one. This is deliberate — links over possibly-stale numbers.
- Crisis detection is regex-based; it catches explicit phrases, not oblique
  ones. This is by design (deterministic, testable) but not exhaustive. Clear
  first-person negations and common school/idiom phrases are guarded, while
  quoted, fictional, or third-person explicit phrases may still route
  conservatively to crisis support.

## Security

- **CSP uses `'unsafe-inline'` for scripts** (Next.js App Router inline
  bootstrap). A nonce-based policy under OpenNext is a follow-up. There is no
  `unsafe-eval` in production (dev-only, for HMR).
- **A localStorage session-token fallback exists** alongside HttpOnly cookies,
  accepted via `Authorization: Bearer`. It exists because Set-Cookie proved
  unreliable on Cloudflare Workers during the Phase 3.x incidents. Mitigations:
  cookie-first self-healing deletes the fallback token whenever cookies alone
  resolve the session; strict CSP; no XSS sinks (no `dangerouslySetInnerHTML`).
  Removal precondition: verified cookie reliability on the deployed Worker
  across the supported browsers.
- Signup still reveals account existence to a patient attacker (no email
  infrastructure for a verification flow); responses are neutralized and
  durable-rate-limited, and login is enumeration-safe with flattened timing.
- PBKDF2 iterations are capped at 100,000 by the Workers WebCrypto limit
  (below the OWASP 600k recommendation for PBKDF2-SHA-256).

## Product

- No password reset or email verification (no email provider connected).
- The "next action" is stored per device (localStorage) for both guests and
  accounts — it is a pointer, not a synced task database, and the UI says so.
- Guest daily limits key on SHA-256(ip|user-agent) and can be evaded by
  rotating either; acceptable for a free beta. These are pseudonymous rather
  than anonymous identifiers: raw IPs are not stored, but the hashes may be
  guessable offline if D1 is disclosed.
- No streaming responses (buffered JSON replies).
- Insights are simple counts by design; no trends until there is enough real
  data to be honest about.
- `/why`, `/impact`, `/case-study`, `/privacy`, `/beta`, login/signup bodies
  are English-only (localized notice shown to ru/kk users).
- No dark-mode toggle (tokens exist; UI ships light).

## Repo

- The declared toolchain is Node 22.22.3 / npm 11.4.2. This independent audit
  ran on Node 24.16.0 / npm 11.13.0 because the declared runtime was not
  installed locally; CI should remain the Node 22 authority.
- `npm audit` currently reports no high/critical advisories but does report 16
  low/moderate findings, largely in frozen Expo/dev tooling plus Next's nested
  PostCSS 8.4.31. There is no user-controlled CSS transformation path in the
  Worker runtime, but dependency remediation remains follow-up work.

- `apps/mobile` is a frozen Expo workspace from the Supabase era — not
  deployed, excluded from tests/build, kept only as a future starting point.
- `supabase/` contains legacy pre-D1 artifacts, unused at runtime.
- Legacy mood/journal schemas remain in `packages/shared` because the frozen
  mobile workspace imports them.
