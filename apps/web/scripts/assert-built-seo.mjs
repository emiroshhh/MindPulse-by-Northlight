import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverOutputDirectory = fileURLToPath(
  new URL('../.next/server/', import.meta.url),
);
const appOutputDirectory = path.join(serverOutputDirectory, 'app');

const publicRoutes = new Map([
  ['/', ['index.html', 'https://usemindpulse.com/']],
  ['/why', ['why.html', 'https://usemindpulse.com/why']],
  ['/beta', ['beta.html', 'https://usemindpulse.com/beta']],
  ['/case-study', ['case-study.html', 'https://usemindpulse.com/case-study']],
  ['/impact', ['impact.html', 'https://usemindpulse.com/impact']],
  ['/privacy', ['privacy.html', 'https://usemindpulse.com/privacy']],
]);

const authRoutes = new Map([
  ['/login', 'login.html'],
  ['/signup', 'signup.html'],
]);

const expectedSitemapUrls = [...publicRoutes.values()].map(([, url]) => url);

const forbiddenOrigins = [
  'http://localhost',
  'https://localhost',
  '127.0.0.1',
  'mindpulse.example',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function headFor(route, html) {
  const head = html.match(/<head>[\s\S]*?<\/head>/i)?.[0];
  assert(head, `${route}: built HTML has no <head>`);
  return head;
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1];
}

function tags(head, name) {
  return head.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) ?? [];
}

function metaContents(head, attributeName, attributeValue) {
  return tags(head, 'meta')
    .filter(
      (tag) =>
        attribute(tag, attributeName)?.toLowerCase() ===
        attributeValue.toLowerCase(),
    )
    .map((tag) => attribute(tag, 'content') ?? '');
}

function canonicalUrls(head) {
  return tags(head, 'link')
    .filter((tag) =>
      attribute(tag, 'rel')?.toLowerCase().split(/\s+/).includes('canonical'),
    )
    .map((tag) => attribute(tag, 'href') ?? '');
}

function openGraphUrls(head) {
  return metaContents(head, 'property', 'og:url');
}

function assertIndexableRobots(route, head) {
  for (const directive of ['robots', 'googlebot']) {
    for (const content of metaContents(head, 'name', directive)) {
      const tokens = content.toLowerCase().split(/[,\s]+/);
      assert(
        !tokens.includes('noindex') && !tokens.includes('none'),
        `${route}: ${directive} metadata prevents indexing`,
      );
    }
  }
}

function assertNoCanonicalOrOpenGraphUrl(route, head) {
  assert(canonicalUrls(head).length === 0, `${route}: unexpected canonical`);
  assert(openGraphUrls(head).length === 0, `${route}: unexpected og:url`);
}

function assertNoForbiddenOrigin(route, head) {
  const normalized = head.toLowerCase();
  for (const forbidden of forbiddenOrigins) {
    assert(
      !normalized.includes(forbidden),
      `${route}: search-facing metadata contains ${forbidden}`,
    );
  }
}

async function builtHead(route, filename) {
  const html = await readFile(path.join(appOutputDirectory, filename), 'utf8');
  return headFor(route, html);
}

async function allBuiltHtmlFiles(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory())
      output.push(...(await allBuiltHtmlFiles(absolute)));
    else if (entry.name.endsWith('.html')) output.push(absolute);
  }
  return output;
}

for (const [route, [filename, expectedUrl]] of publicRoutes) {
  const head = await builtHead(route, filename);
  const canonicals = canonicalUrls(head);
  const openGraph = openGraphUrls(head);

  assert(
    canonicals.length === 1,
    `${route}: expected exactly one canonical, found ${canonicals.length}`,
  );
  assert(
    openGraph.length === 1,
    `${route}: expected exactly one og:url, found ${openGraph.length}`,
  );
  assert(
    new URL(canonicals[0]).href === expectedUrl,
    `${route}: canonical is ${canonicals[0]}, expected ${expectedUrl}`,
  );
  assert(
    new URL(openGraph[0]).href === expectedUrl,
    `${route}: og:url is ${openGraph[0]}, expected ${expectedUrl}`,
  );

  for (const property of [
    'og:type',
    'og:site_name',
    'og:title',
    'og:description',
  ]) {
    assert(
      metaContents(head, 'property', property).length === 1,
      `${route}: expected one ${property} metadata value`,
    );
  }

  assertIndexableRobots(route, head);
  assertNoForbiddenOrigin(route, head);
}

for (const [route, filename] of authRoutes) {
  const head = await builtHead(route, filename);
  assertNoCanonicalOrOpenGraphUrl(route, head);
  assertNoForbiddenOrigin(route, head);
  const tokens = metaContents(head, 'name', 'robots')
    .flatMap((content) => content.toLowerCase().split(/[,\s]+/))
    .filter(Boolean);
  assert(
    tokens.length === 2 &&
      tokens.includes('noindex') &&
      tokens.includes('follow'),
    `${route}: expected robots content "noindex, follow"`,
  );
}

const approvedHtmlFiles = new Set(
  [
    ...[...publicRoutes.values()].map(([filename]) => filename),
    ...authRoutes.values(),
  ].map((filename) => path.resolve(appOutputDirectory, filename)),
);
const builtHtmlFiles = await allBuiltHtmlFiles(serverOutputDirectory);
for (const filename of builtHtmlFiles) {
  if (approvedHtmlFiles.has(path.resolve(filename))) continue;
  const relative = path
    .relative(serverOutputDirectory, filename)
    .replaceAll('\\', '/');
  const head = headFor(`/${relative}`, await readFile(filename, 'utf8'));
  assertNoCanonicalOrOpenGraphUrl(`/${relative}`, head);
  assertNoForbiddenOrigin(`/${relative}`, head);
}

const prerenderManifest = JSON.parse(
  await readFile(
    fileURLToPath(new URL('../.next/prerender-manifest.json', import.meta.url)),
    'utf8',
  ),
);
for (const route of ['/robots.txt', '/sitemap.xml']) {
  assert(
    Object.hasOwn(prerenderManifest.routes, route),
    `${route}: missing from prerender manifest`,
  );
}

const sitemapXml = await readFile(
  path.join(appOutputDirectory, 'sitemap.xml.body'),
  'utf8',
);
const sitemapLocations = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map(
  ([, location]) => new URL(location).href,
);
const sitemapEntries = sitemapXml.match(/<url(?:\s|>)/gi) ?? [];
assert(
  sitemapEntries.length === 6,
  'sitemap: expected exactly six <url> entries',
);
assert(
  sitemapLocations.length === 6,
  'sitemap: expected exactly six <loc> entries',
);
assert(
  new Set(sitemapLocations).size === sitemapLocations.length,
  'sitemap: duplicate URL entry',
);
assert(
  new Set(sitemapLocations).size === expectedSitemapUrls.length &&
    expectedSitemapUrls.every((url) => sitemapLocations.includes(url)),
  'sitemap: URL set does not match approved marketing routes',
);
assert(
  !/<(?:lastmod|changefreq|priority)>/i.test(sitemapXml),
  'sitemap: contains fabricated freshness or priority metadata',
);

const robotsText = await readFile(
  path.join(appOutputDirectory, 'robots.txt.body'),
  'utf8',
);
const robotsDirectives = new Map();
for (const line of robotsText.split(/\r?\n/)) {
  const match = line.match(/^\s*([^:#]+):\s*(.*?)\s*$/);
  if (!match) continue;
  const key = match[1].toLowerCase();
  robotsDirectives.set(key, [...(robotsDirectives.get(key) ?? []), match[2]]);
}
assert(
  JSON.stringify(robotsDirectives.get('user-agent')) === JSON.stringify(['*']),
  'robots: expected only User-agent: *',
);
assert(
  JSON.stringify(robotsDirectives.get('allow')) === JSON.stringify(['/']),
  'robots: expected only Allow: /',
);
assert(
  JSON.stringify(robotsDirectives.get('disallow')) ===
    JSON.stringify(['/api/']),
  'robots: expected only Disallow: /api/',
);
assert(
  JSON.stringify(robotsDirectives.get('sitemap')) ===
    JSON.stringify(['https://usemindpulse.com/sitemap.xml']),
  'robots: expected the production sitemap URL',
);
assert(
  [...robotsDirectives.keys()].every((key) =>
    ['user-agent', 'allow', 'disallow', 'sitemap'].includes(key),
  ),
  'robots: contains an unexpected directive',
);

console.log(
  `SEO build assertions passed for ${builtHtmlFiles.length} generated HTML documents (${publicRoutes.size} public and ${authRoutes.size} auth), sitemap.xml, and robots.txt.`,
);
