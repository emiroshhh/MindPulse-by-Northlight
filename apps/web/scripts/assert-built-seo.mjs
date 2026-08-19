import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webDirectory = fileURLToPath(new URL('../', import.meta.url));
const appOutputDirectory = path.join(webDirectory, '.next', 'server', 'app');
const workerAssetsDirectory = path.join(webDirectory, '.open-next', 'assets');
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
const localizedRoutes = paths.flatMap((suffix) =>
  locales.map((locale) => `/${locale}${suffix}`),
);
const expectedSitemapUrls = localizedRoutes.map(
  (route) => `https://usemindpulse.com${route}`,
);
const forbiddenOrigins = [
  'http://localhost',
  'https://localhost',
  '127.0.0.1',
  'mindpulse.example',
  '.workers.dev',
  'www.usemindpulse.com',
  'http://usemindpulse.com',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertNoForbiddenOrigin(label, content) {
  const normalized = content.toLowerCase();
  for (const forbidden of forbiddenOrigins) {
    assert(
      !normalized.includes(forbidden),
      `${label}: search-facing output contains ${forbidden}`,
    );
  }
}

const appPathManifest = JSON.parse(
  await readFile(
    path.join(webDirectory, '.next', 'app-path-routes-manifest.json'),
  ),
);
for (const route of localizedRoutes) {
  assert(
    Object.values(appPathManifest).includes(route),
    `${route}: missing from the production app route manifest`,
  );
  const routeFile = `${route.slice(1)}/page.js`;
  await access(path.join(appOutputDirectory, routeFile));
}
for (const route of ['/login', '/signup']) {
  assert(
    Object.values(appPathManifest).includes(route),
    `${route}: missing from the production app route manifest`,
  );
}

const sitemapXml = await readFile(
  path.join(appOutputDirectory, 'sitemap.xml.body'),
  'utf8',
);
const sitemapLocations = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map(
  ([, location]) => new URL(location).href,
);
assert(
  (sitemapXml.match(/<url(?:\s|>)/gi) ?? []).length === 32,
  'sitemap: expected exactly 32 <url> entries',
);
assert(sitemapLocations.length === 32, 'sitemap: expected 32 <loc> entries');
assert(
  new Set(sitemapLocations).size === sitemapLocations.length,
  'sitemap: duplicate URL entry',
);
assert(
  new Set(sitemapLocations).size === expectedSitemapUrls.length &&
    expectedSitemapUrls.every((url) => sitemapLocations.includes(url)),
  'sitemap: URL set does not match the approved marketing routes',
);
assert(
  !/<(?:lastmod|changefreq|priority)>/i.test(sitemapXml),
  'sitemap: contains fabricated freshness or priority metadata',
);
assert(
  (sitemapXml.match(/<xhtml:link\b/gi) ?? []).length === 160,
  'sitemap: expected five hreflang links for each localized URL',
);
assertNoForbiddenOrigin('sitemap', sitemapXml);

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
assertNoForbiddenOrigin('robots', robotsText);

const manifest = JSON.parse(
  await readFile(path.join(workerAssetsDirectory, 'manifest.webmanifest')),
);
assert(
  manifest.description ===
    'An AI study and productivity workspace for students.',
  'manifest: production description changed unexpectedly',
);
assert(
  manifest.name === 'MindPulse' &&
    manifest.short_name === 'MindPulse' &&
    manifest.start_url === '/' &&
    manifest.display === 'standalone' &&
    manifest.background_color === '#f7f8f4' &&
    manifest.theme_color === '#56776f',
  'manifest: unrelated application behavior changed',
);

const socialImage = await readFile(
  path.join(workerAssetsDirectory, 'mindpulse-social-preview.png'),
);
assert(
  socialImage.subarray(1, 4).toString('ascii') === 'PNG',
  'social preview: expected a PNG asset',
);
assert(
  socialImage.readUInt32BE(16) === 1200 && socialImage.readUInt32BE(20) === 630,
  'social preview: expected exact 1200 by 630 dimensions',
);

console.log(
  `SEO artifact assertions passed for ${localizedRoutes.length} localized production route modules, sitemap.xml, robots.txt, manifest, and social preview. Raw server HTML is validated separately against the OpenNext Worker.`,
);
