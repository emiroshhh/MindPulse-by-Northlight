# MindPulse v2 audit

Audit date: 2026-06-22. Scope: web PWA, Expo client, shared safety package, AI route, desktop and 375px layouts.

## Baseline findings

| Area             | Before             | Finding                                                                                                                                                                      | Fix / after                                                                                                                                                     |
| ---------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/` onboarding   | Working            | Warm and keyboard-usable, but initial loader is only an icon and the dashboard has no tailored next step.                                                                    | Add designed loading treatment and adaptive exercise recommendation.                                                                                            |
| Today            | Working            | Mood logging persists locally. Empty/current state is clear.                                                                                                                 | Add a polished mood-to-exercise flagship card driven by real check-in data.                                                                                     |
| Companion        | Broken without env | Default provider is OpenAI even when no server key exists, so local use returns HTTP 503. Errors replace the reply but offer no retry. No starter prompts or opt-in context. | Add safe automatic local fallback for development, provider timeout, structured errors, retry, prompt chips, bounded mood context and clean markdown rendering. |
| Companion safety | Working            | Input and output are screened; crisis input bypasses the model. No route-level regression test.                                                                              | Add crisis and demo-provider route tests; preserve fixed crisis reply and resource metadata.                                                                    |
| Journal          | Working            | Create/edit/delete and empty state work locally.                                                                                                                             | Retain behavior; include journal data only in export, never implicit AI context.                                                                                |
| Exercises        | Working            | Four complete guided flows and reduced-motion support.                                                                                                                       | Use adaptive suggestion as the flagship entry point.                                                                                                            |
| Insights         | Working            | Gentle trend and empty state are present; no clinical claims.                                                                                                                | Keep conclusions explicitly non-clinical.                                                                                                                       |
| Safety           | Working            | Always reachable, bilingual and uses centrally governed resources.                                                                                                           | No hotline values added; verification gate remains intact.                                                                                                      |
| Settings/login   | Working            | Export, local deletion, language and theme controls work. Supabase login degrades to a friendly error when unconfigured.                                                     | Keep controls and clarify AI context opt-in in chat.                                                                                                            |
| `/style`         | Missing            | No visible design-system reference.                                                                                                                                          | Add token, typography, component and state reference route.                                                                                                     |
| Mobile           | Mostly working     | Shared endpoint and safety are used. Older WebViews previously lacked `randomUUID`; fixed in v1. Streaming error handling is minimal.                                        | Reuse structured server errors and keep fallback ID generator.                                                                                                  |

## Console, network, and streaming

- Browser console is clean after the v1 hydration and ID fixes.
- Production build succeeds.
- Root cause of the reported AI failure: `.env` has no provider key while `/api/chat` defaults to `openai`; the route returns `503 "not configured"`.
- Provider output is deliberately buffered for a complete safety pass before approved text is streamed to the client. This is a safety/latency tradeoff, not a broken stream.
- Missing resilience: provider timeout, actionable 429 message, mid-stream recovery and retry.

## Accessibility and responsive layout

- Dark-mode contrast and mood-face contrast were fixed in v1 and have regression tests.
- Focus styles, semantic headings, labels, skip link and reduced-motion rules are present.
- Mobile at 375–390px is usable; closed off-canvas navigation was still discoverable to assistive technology and was changed to `visibility: hidden` when closed.
- Remaining v2 work: ensure starter chips and retry controls have 44px targets; keep context opt-in explicit and screen-reader labelled.

## Performance

- Current production route sizes: `/` about 19 kB route code / 208 kB first load; `/login` about 5 kB / 194 kB first load.
- No remote font or audio dependency. Heavy chart library is not used.
- The AI route is capped at 700 output tokens and eight requests per ten minutes per instance-local identity bucket.
- Instance-local rate limiting is acceptable for the demo but must move to a shared store before a broad launch.

## Safety invariants for this pass

1. Crisis input never reaches an AI provider.
2. Full model output is screened before any approved text reaches the client.
3. Demo fallback is non-clinical, bounded and server-side.
4. Mood context is opt-in, minimal and described to the user.
5. No unverified crisis phone number is introduced.
