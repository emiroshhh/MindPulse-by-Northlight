# Search Console monitoring after deployment

Use the existing verified HTTPS apex property and the submitted sitemap. Do not request indexing for redirects, app/auth/API URLs, or duplicate variants.

## Deployment-day checks

1. Open the sitemap report and revalidate `https://usemindpulse.com/sitemap.xml`.
2. Confirm the submitted sitemap reports 32 canonical URLs after the acquisition pages deploy.
3. Inspect one URL for each page concept and language, including both new concepts.
4. For each inspected URL, verify:
   - the page is allowed to be indexed;
   - the user-declared canonical and Google-selected canonical are the same localized URL;
   - the last crawl receives HTTP 200;
   - no redirect, noindex, or blocked-resource conflict appears.
5. Check that `/`, unprefixed marketing paths, HTTP, and www are treated as redirects rather than indexed pages.

## Seven-day review

1. In Page indexing, separate “Discovered”, “Crawled”, “Indexed”, “Duplicate”, “Redirect”, and error states for the 32 sitemap URLs.
2. Inspect at least these eight URLs: `/en/ai-study-planner`, `/ru/ai-study-planner`, `/kk/ai-study-planner`, `/es/ai-study-planner`, and the four `/catch-up-on-schoolwork` equivalents.
3. In Performance → Search results, compare by:
   - page;
   - query;
   - country;
   - device;
   - search appearance, if populated.
4. Record impressions and clicks without judging CTR on pages with very few impressions.
5. Look for unexpected language/query combinations, such as Spanish queries landing on English URLs.
6. Review crawl errors and server errors. Treat any Cloudflare-only 404 on a localized route as P0.
7. Do not rewrite pages after one week merely because impressions are low; indexing and query matching need time.

## Thirty-day review

1. Export page/query data for the last 28 days and preserve it as the first post-launch comparison window.
2. Group non-brand queries by intent: planner/tool, exam planning, assignment breakdown, catch-up/recovery, procrastination/start, privacy/trust, and brand.
3. For each language, identify:
   - queries with impressions but weak page alignment;
   - pages earning clicks from unexpected useful queries;
   - pages with impressions but consistently weak CTR at a meaningful sample size;
   - pages still not indexed or assigned a different canonical;
   - countries where the language/query match suggests a localization opportunity.
4. Improve titles or introductions only when the query set shows a clear mismatch. Preserve the page purpose instead of stuffing every variant.
5. Add another acquisition topic only if distinct queries and real user behavior show a gap that cannot be answered well by the two current guides.
6. Compare organic landing sessions with privacy-respecting product-entry events. Do not infer retention from anonymous aggregate counters.

## Escalation rules

- P0: canonical points elsewhere, hreflang asymmetry, sitemap URL returns non-200, localized route returns Cloudflare 404, or a public page receives noindex.
- P1: sustained impressions reveal a clear intent mismatch, wrong-language landing, or no meaningful path from landing page to the relevant tool.
- P2: title/description CTR experiment with enough impressions to evaluate.
- P3: speculative schema, dozens of keyword variants, or changes based on vanity audit scores.
