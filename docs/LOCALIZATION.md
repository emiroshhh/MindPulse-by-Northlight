# MindPulse Localization Coverage

Last updated: 2026-07-14

Supported UI languages: English (`en`), Russian (`ru`), Kazakh (`kk`, labeled
**beta** in the picker). Selection persists in localStorage
(`mindpulse-language-v1`) and is applied to `<html lang>` on every page
(`LanguageHtmlSync` + `applyDocumentLanguage`).

## Coverage matrix

| Surface                                                                | en      | ru      | kk                 |
| ---------------------------------------------------------------------- | ------- | ------- | ------------------ |
| Dashboard (next action, quick start, insights, recovery card, account) | ✓       | ✓       | ✓                  |
| Six tool pages incl. guided intake fields                              | ✓       | ✓       | ✓                  |
| Chat panel (states, limits, errors, crisis block)                      | ✓       | ✓       | ✓                  |
| Recovery Mode (all steps, plan, fallback copy)                         | ✓       | ✓       | ✓                  |
| Feedback form (questions, consent, states)                             | ✓       | ✓       | ✓                  |
| Crisis replies + resource strings                                      | ✓       | ✓       | ✓ (paired with ru) |
| Landing page                                                           | ✓       | ✓       | ✓                  |
| Footer / guest banner / auth nav                                       | ✓       | ✓       | ✓                  |
| /privacy, /beta, /why, /impact, /case-study                            | ✓       | notice¹ | notice¹            |
| Login/signup pages                                                     | English | notice¹ | notice¹            |

¹ Long-form pages are intentionally English-only for now; ru/kk users see a
localized "this page is currently English-only" notice (`EnglishOnlyNotice`).
This is honest scoping — a clear notice instead of half-translated privacy or
safety text.

## Structure

- `apps/web/lib/mindpulse/i18n.ts` — typed `UiCopy` (compile-time key parity
  across locales) + `chatCopyFor` + tool translations.
- `apps/web/lib/mindpulse/marketing-i18n.ts` — typed landing copy + the
  English-only notice strings.
- `packages/shared/src/safety/index.ts` — safety-critical strings, typed by
  `SafetyLocale`.

## Automated completeness check

`apps/web/lib/mindpulse/i18n-completeness.test.ts` walks every copy object in
all three locales and fails on: empty strings, missing keys (chat copy key
parity), missing tools/intake fields, and ru/kk values that merely duplicate
English. TypeScript enforces that a new `UiCopy` key must be added to all
three locales before the build compiles.

## Kazakh status (honest)

All kk strings were written without native review and are flagged
`NEEDS NATIVE REVIEW` in code. Consequences already implemented:

- picker label `Қазақша (beta)`;
- crisis replies and blocked-output fallbacks show kk **and** ru together;
- README/case study make no claim of full Kazakh support.

Before removing the beta label: native review of safety patterns, crisis
reply, tool copy, and the landing page.
