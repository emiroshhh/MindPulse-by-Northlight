const baseUrl = (
  process.env.SEO_AUDIT_BASE_URL ?? 'http://127.0.0.1:8787'
).replace(/\/$/, '');
const canonicalOrigin = 'https://usemindpulse.com';
const locales = ['en', 'ru', 'kk', 'es'];
const paths = [
  '',
  '/why',
  '/beta',
  '/case-study',
  '/impact',
  '/privacy',
  '/ai-study-planner',
  '/catch-up-on-schoolwork',
];
const routes = paths.flatMap((suffix) =>
  locales.map((locale) => ({ locale, suffix, route: `/${locale}${suffix}` })),
);
const forbiddenOrigins = [
  'http://localhost',
  '127.0.0.1',
  '.workers.dev',
  'www.usemindpulse.com',
  'http://usemindpulse.com',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function attribute(tag, name) {
  const value = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'),
  )?.[1];
  return value === undefined ? undefined : decodeHtml(value);
}

function tags(head, name) {
  return head.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) ?? [];
}

function metadata(head, attributeName, attributeValue) {
  return tags(head, 'meta')
    .filter(
      (tag) =>
        attribute(tag, attributeName)?.toLowerCase() ===
        attributeValue.toLowerCase(),
    )
    .map((tag) => attribute(tag, 'content') ?? '');
}

function links(head, rel) {
  return tags(head, 'link').filter((tag) =>
    attribute(tag, 'rel')?.toLowerCase().split(/\s+/).includes(rel),
  );
}

function exactlyOne(label, values, expected) {
  assert(values.length === 1, `${label}: expected one, found ${values.length}`);
  if (expected !== undefined) {
    assert(values[0] === expected, `${label}: ${values[0]} !== ${expected}`);
  }
}

function visibleText(html) {
  return decodeHtml(
    html
      .replace(
        /<(?:script|style|template|svg)\b[\s\S]*?<\/(?:script|style|template|svg)>/gi,
        ' ',
      )
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' '),
  ).trim();
}

const incoming = new Map(routes.map(({ route }) => [route, new Set()]));
for (const { locale, suffix, route } of routes) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: 'manual' });
  assert(
    response.status === 200,
    `${route}: expected 200, received ${response.status}`,
  );
  const html = await response.text();
  const head = html.match(/<head>[\s\S]*?<\/head>/i)?.[0];
  assert(head, `${route}: raw response has no head`);
  // Next.js may stream metadata after the initial head for ordinary user agents.
  // Audit the complete raw response; no client-side hydration is involved.
  const metadataSource = html;
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0];
  assert(
    attribute(htmlTag ?? '', 'lang') === locale,
    `${route}: raw html lang is not ${locale}`,
  );
  const expectedCanonical = `${canonicalOrigin}${route}`;
  exactlyOne(
    `${route} title`,
    [...metadataSource.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map(
      (match) => decodeHtml(match[1]),
    ),
  );
  exactlyOne(
    `${route} description`,
    metadata(metadataSource, 'name', 'description'),
  );
  exactlyOne(
    `${route} canonical`,
    links(metadataSource, 'canonical').map(
      (tag) => attribute(tag, 'href') ?? '',
    ),
    expectedCanonical,
  );
  exactlyOne(
    `${route} og:url`,
    metadata(metadataSource, 'property', 'og:url'),
    expectedCanonical,
  );
  exactlyOne(
    `${route} og:title`,
    metadata(metadataSource, 'property', 'og:title'),
  );
  exactlyOne(
    `${route} og:description`,
    metadata(metadataSource, 'property', 'og:description'),
  );
  exactlyOne(
    `${route} twitter:card`,
    metadata(metadataSource, 'name', 'twitter:card'),
    'summary_large_image',
  );
  exactlyOne(
    `${route} twitter:title`,
    metadata(metadataSource, 'name', 'twitter:title'),
  );
  exactlyOne(
    `${route} twitter:description`,
    metadata(metadataSource, 'name', 'twitter:description'),
  );
  const alternateMap = Object.fromEntries(
    links(metadataSource, 'alternate').map((tag) => [
      attribute(tag, 'hreflang'),
      attribute(tag, 'href'),
    ]),
  );
  const expectedAlternates = Object.fromEntries(
    locales.map((alternateLocale) => [
      alternateLocale,
      `${canonicalOrigin}/${alternateLocale}${suffix}`,
    ]),
  );
  expectedAlternates['x-default'] = expectedAlternates.en;
  assert(
    JSON.stringify(alternateMap) === JSON.stringify(expectedAlternates),
    `${route}: incomplete or asymmetric hreflang`,
  );
  const robots = metadata(metadataSource, 'name', 'robots')
    .join(',')
    .toLowerCase();
  assert(
    !robots.includes('noindex') && !robots.includes('none'),
    `${route}: unexpectedly noindex`,
  );
  for (const forbidden of forbiddenOrigins) {
    assert(
      !metadataSource.toLowerCase().includes(forbidden),
      `${route}: contains forbidden host ${forbidden}`,
    );
  }
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  assert(
    h1 && visibleText(h1).length >= 20,
    `${route}: missing a meaningful raw H1`,
  );
  const words = visibleText(html).split(/\s+/).filter(Boolean);
  assert(
    words.length >= 180,
    `${route}: raw response is unexpectedly thin (${words.length} words)`,
  );
  for (const anchor of html.match(/<a\b[^>]*>/gi) ?? []) {
    const href = attribute(anchor, 'href');
    if (!href) continue;
    const pathname = href.startsWith(canonicalOrigin)
      ? new URL(href).pathname
      : href.split(/[?#]/, 1)[0];
    const targetLocale = pathname.split('/')[1];
    if (
      pathname !== route &&
      targetLocale === locale &&
      incoming.has(pathname)
    ) {
      incoming.get(pathname).add(route);
    }
  }
}

for (const [route, sources] of incoming) {
  assert(sources.size >= 1, `${route}: has no crawlable incoming public link`);
}

for (const suffix of paths) {
  const legacy = suffix || '/';
  const response = await fetch(`${baseUrl}${legacy}`, { redirect: 'manual' });
  assert(
    [301, 308].includes(response.status),
    `${legacy}: expected a permanent redirect`,
  );
  const redirectTarget = new URL(
    response.headers.get('location') ?? '',
    baseUrl,
  ).pathname;
  assert(
    redirectTarget === `/en${suffix}`,
    `${legacy}: wrong English redirect target`,
  );
}

const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
assert(sitemapResponse.status === 200, 'sitemap: expected 200');
const sitemap = await sitemapResponse.text();
assert(
  (sitemap.match(/<loc>/g) ?? []).length === 32,
  'sitemap: expected 32 URLs',
);
for (const { route } of routes) {
  assert(
    sitemap.includes(`<loc>${canonicalOrigin}${route}</loc>`),
    `sitemap: missing ${route}`,
  );
}
const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
assert(robotsResponse.status === 200, 'robots: expected 200');
const robots = await robotsResponse.text();
assert(robots.includes('Disallow: /api/'), 'robots: API exclusion missing');
assert(
  robots.includes(`${canonicalOrigin}/sitemap.xml`),
  'robots: canonical sitemap missing',
);

for (const route of ['/app', '/login', '/signup']) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: 'manual' });
  assert(response.status === 200, `${route}: expected 200`);
  assert(
    (await response.text()).toLowerCase().includes('noindex'),
    `${route}: noindex missing`,
  );
}
for (const route of ['/logout', '/api/events']) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: 'manual' });
  assert(
    response.headers.get('x-robots-tag')?.toLowerCase().includes('noindex'),
    `${route}: X-Robots-Tag noindex missing`,
  );
}
for (const route of ['/fr', '/en/not-a-route', '/ru/app']) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: 'manual' });
  assert(
    response.status === 404,
    `${route}: expected 404, received ${response.status}`,
  );
  assert(
    (await response.text()).toLowerCase().includes('noindex'),
    `${route}: 404 noindex missing`,
  );
}

console.log(
  `Raw SEO origin audit passed at ${baseUrl}: 32 localized indexable pages, 8 redirects, reciprocal hreflang, internal incoming links, sitemap, robots, noindex protections, and invalid-route behavior.`,
);
