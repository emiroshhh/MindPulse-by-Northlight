# MindPulse AI Safety

Last updated: 2026-07-14

MindPulse is a productivity and learning assistant. It is **not** therapy,
medical care, diagnosis, professional mental-health support, or an emergency
service — and it says so in the product.

## Deterministic pipeline

Every AI-facing route (`/api/chat`, `/api/recovery`, quick-start on the
dashboard) runs the same order of operations:

1. **Validate and normalize input** (length caps, strict enums for
   mode/language, JSON schema for recovery requests).
2. **Deterministic high-risk screening before any generation** —
   `assessUserInput` in `packages/shared/src/safety/index.ts` (pure regex, no
   model involved). Flagged input never reaches the AI provider and never
   consumes quota.
3. **Crisis routing to reviewed deterministic content** — a localized crisis
   reply plus support-resource links rendered as a distinct `role="alert"`
   block, not a normal chat bubble.
4. **Normal generation** only for unflagged input.
5. **Output screening** — `assessModelOutput` blocks diagnostic claims,
   harmful-behavior instructions, isolation language, and sexual content;
   blocked output is replaced by a localized safe fallback.
6. Return the safe response. Raw provider errors are never exposed (generic
   coded errors only) and provider bodies are never logged.

## Language coverage

| Language | Input patterns | Crisis reply | Status                         |
| -------- | -------------- | ------------ | ------------------------------ |
| English  | yes            | yes          | reviewed                       |
| Russian  | yes            | yes          | reviewed                       |
| Kazakh   | yes            | yes          | **beta — NEEDS NATIVE REVIEW** |

Policy: a safety message must never be readable only in an unreviewed
translation. Until Kazakh gets native review, kk users receive the Kazakh
crisis text **together with the Russian text** (`crisisRepliesFor` /
`safeOutputFallbacksFor`). All kk patterns and strings are flagged
`NEEDS NATIVE REVIEW` in code.

False-positive guards cover idioms in all three languages ("kill time",
"that test killed me", «умереть от смеха», «этот экзамен меня убил»,
«дедлайн меня убивает», «күлкіден өлдім»). Note: JS `\b` does not match next
to Cyrillic, so Cyrillic patterns must not use word boundaries (a real bug
fixed during this transformation).

## Support resources

Defined in `packages/shared/src/safety/resources.ts` with region, source, and
verification date. Rules:

- **No invented phone numbers.** Entries marked `verification_required` keep
  `phone: null` until a human verifies the number against the linked
  government/helpline source. Links only.
- **No location assumption.** Resources are resolved from the request's
  `cf-ipcountry` header; unknown regions get the international directory
  (findahelpline.com, verified 2026-06-22), not Kazakhstan-specific content.

## Prompt behavior

`buildSystemPrompt` (per tool mode) instructs the model to: give specific,
prioritized actions; account for stated deadlines/constraints; avoid generic
motivation and toxic positivity; admit uncertainty; never claim memory it does
not have; never present itself as a counselor; follow the student's language.
Recovery prompts additionally demand strict JSON matching the zod schema; two
failed validations produce a deterministic non-AI plan built only from the
student's own items (nothing invented, at most 3 urgent items, fixed deadlines
first). Every schema-valid provider attempt is also screened for unsafe model
output before it can be accepted.

## Tests

`packages/shared/tests/safety.test.ts` + `apps/web/app/api/chat/route.test.ts`

- `apps/web/app/api/recovery/route.test.ts` cover: en/ru/kk true positives,
  en/ru/kk idiom false positives, localized reply pairing for kk, region-scoped
  resources, quota not consumed by crisis replies, blocked-output replacement,
  JSON repair/fallback, recovery-output screening, and no provider-body logging.
