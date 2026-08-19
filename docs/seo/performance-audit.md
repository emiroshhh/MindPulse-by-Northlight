# Public-route performance audit

- Date: 2026-08-20
- Tool: Lighthouse CLI 13.4.1, mobile defaults, headless Chrome
- Route: `/en`

## Measurements

| Environment                            |   Samples | Performance |      FCP |      LCP | TBT (INP proxy only) | CLS | Server response | Transfer | Script transfer |
| -------------------------------------- | --------: | ----------: | -------: | -------: | -------------------: | --: | --------------: | -------: | --------------: |
| Current production                     | 3, median |          81 | 1,731 ms | 4,993 ms |                75 ms |   0 |          383 ms | 718.3 KB |        653.6 KB |
| Candidate OpenNext Worker on localhost | 3, median |          98 |   776 ms | 2,393 ms |                67 ms |   0 |           18 ms | 214.1 KB |        196.7 KB |

The environments are not directly comparable: production includes the public network, TLS, deployed edge behavior, and the currently deployed bundle; localhost does not. The candidate result is therefore a pre-deploy lab check, not a claim that production LCP or transfer size has already improved. Repeat the same three-run production sample after deployment.

One final candidate sample after removing application-only hydration from exact marketing routes measured 98 performance, 779 ms FCP, 2,379 ms LCP, 50 ms TBT, 0 CLS, and 16 ms server response. One sample of the new `/en/ai-study-planner` page measured 97 performance, 775 ms FCP, 2,397 ms LCP, 72 ms TBT, 0 CLS, and 14 ms server response.

## Interpretation

- Current production's lab LCP is above the approximately 2.5-second target and should be checked again with post-deploy field data.
- The generated Worker stayed near the target in local mobile lab runs and had no measured layout shift.
- INP cannot be established by a short Lighthouse lab run. TBT is recorded only as an interaction-responsiveness proxy; Search Console Core Web Vitals or other privacy-respecting field data is required for INP.
- Exact marketing routes no longer hydrate the application language provider, localized application skip-link component, or service-worker registration. Application, authentication, and tool routes retain those behaviors.
- Acquisition pages are server components with meaningful H1, content, links, and metadata in raw Worker output.
- Lighthouse's local SEO category reports streamed metadata differently from a deployed crawl. The raw-response audit verifies the complete response, and Bingbot, Twitterbot, and `facebookexternalhit` checks confirmed blocking title and canonical metadata in `<head>`.

## Deferred performance work

- Do not change fonts, global application hydration, or the service worker based only on localhost scores.
- Do not optimize the approximately 1 MB social preview asset as an LCP resource: it is referenced for social sharing and is not fetched as public-page content in these runs.
- Use real post-deploy LCP and INP data to decide whether further client-boundary or asset work is justified.
