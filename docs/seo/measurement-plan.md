# Privacy-respecting organic acquisition measurement

## Funnel

Search impressions → search clicks → organic landing sessions → meaningful product entry → tool started → tool completed

## What can be measured now

| Funnel stage             | Source                                | Available?                                       | Boundary                                                                                              |
| ------------------------ | ------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Search impressions       | Google Search Console                 | Yes after deployment/indexing                    | Aggregate page/query/country/device data; not available to this implementation task                   |
| Search clicks            | Google Search Console                 | Yes after deployment/indexing                    | Aggregate; do not fabricate or extrapolate                                                            |
| Organic landing sessions | Existing analytics                    | Not confirmed                                    | Current aggregate event model does not expose a verified referrer/landing-session metric in this task |
| Meaningful product entry | Existing allowlisted aggregate events | Partly                                           | A click alone is not proof that a tool started                                                        |
| Tool started             | Existing allowlisted aggregate events | Partly                                           | Confirm the event taxonomy before reporting; do not add user identifiers                              |
| Tool completed           | Existing allowlisted aggregate events | Partly                                           | Completion must represent an actual saved/generated completion state, not page load                   |
| Retention                | Existing aggregate counters           | Not reliably attributable to organic acquisition | Do not claim organic retention without an approved privacy-safe cohort method                         |

## Recommended implementation sequence

1. Use Search Console as the source of truth for impressions, clicks, queries, pages, countries, and devices.
2. Audit the current anonymous event allowlist after merge and map only events that already represent product entry, start, and completion.
3. If landing-session attribution is absent, report the gap. Do not introduce cross-page personal identifiers, fingerprinting, or raw referrer logs solely for SEO.
4. If a new event is separately approved, prefer an aggregate event such as `organic_public_tool_entry` with coarse values for locale and landing-page concept. Do not store query text, URL parameters, user ID, session ID, IP, or chat content.
5. Review the funnel by language and landing-page concept. A useful SEO outcome is not just a click; it is a visitor reaching and completing the relevant workflow.

## Decision rules

- High impressions + low clicks: inspect title/description and query alignment after enough data exists.
- Clicks + weak product entry: improve the landing page's explanation, CTA, or workflow match.
- Product entry + weak completion: treat as a product/workflow issue, not a reason to create more SEO pages.
- No impressions: confirm indexing and canonical selection before changing content.
