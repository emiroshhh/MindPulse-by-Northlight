import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverOutputDirectory = fileURLToPath(
  new URL('../.next/server/', import.meta.url),
);
const appOutputDirectory = path.join(serverOutputDirectory, 'app');
const workerAssetsDirectory = fileURLToPath(
  new URL('../.open-next/assets/', import.meta.url),
);
const socialImageUrl = 'https://usemindpulse.com/mindpulse-social-preview.png';
const socialImageAlt =
  'MindPulse by Northlight — AI study support for students';

const publicRoutes = new Map([
  [
    '/',
    {
      filename: 'index.html',
      url: 'https://usemindpulse.com/',
      title: 'MindPulse — AI Study Assistant & Planner for Students',
      description:
        'MindPulse is an AI study assistant for students that turns real tasks, deadlines, and stuck points into clear next steps, realistic plans, and recovery support.',
    },
  ],
  [
    '/why',
    {
      filename: 'why.html',
      url: 'https://usemindpulse.com/why',
      title: 'Why MindPulse Was Built — Student-First AI Support',
      description:
        'Why MindPulse was built: a student-first AI workspace designed to make studying, planning, and restarting after missed days more manageable.',
    },
  ],
  [
    '/beta',
    {
      filename: 'beta.html',
      url: 'https://usemindpulse.com/beta',
      title: 'MindPulse Student Beta — Test the AI Study Workspace',
      description:
        'Try the MindPulse student beta on one real task, deadline, habit, goal, or planning problem, then share anonymous feedback about what helped.',
    },
  ],
  [
    '/case-study',
    {
      filename: 'case-study.html',
      url: 'https://usemindpulse.com/case-study',
      title: 'MindPulse Case Study — Safety, Privacy & Architecture',
      description:
        'A transparent case study of how MindPulse approaches AI student support, product design, safety, privacy, and its technical architecture.',
    },
  ],
  [
    '/impact',
    {
      filename: 'impact.html',
      url: 'https://usemindpulse.com/impact',
      title: 'MindPulse Impact — Beta Goals & Measurement',
      description:
        'How MindPulse measures beta impact through honest goals, anonymous usage signals, student feedback, and iteration without inflated claims.',
    },
  ],
  [
    '/privacy',
    {
      filename: 'privacy.html',
      url: 'https://usemindpulse.com/privacy',
      title: 'MindPulse Privacy — How Student Data Is Handled',
      description:
        'Plain-language details on what MindPulse stores for guests and accounts, how AI processing works, usage limits, feedback, retention, and deletion.',
    },
  ],
]);

const authRoutes = new Map([
  ['/login', 'login.html'],
  ['/signup', 'signup.html'],
]);

const expectedSitemapUrls = [...publicRoutes.values()].map(({ url }) => url);

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

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function headFor(route, html) {
  const head = html.match(/<head>[\s\S]*?<\/head>/i)?.[0];
  assert(head, `${route}: built HTML has no <head>`);
  return head;
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

function titleContents(head) {
  return [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map(
    ([, content]) => decodeHtml(content),
  );
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

function assertExactly(route, label, actual, expected) {
  assert(
    actual.length === 1,
    `${route}: expected exactly one ${label}, found ${actual.length}`,
  );
  assert(
    actual[0] === expected,
    `${route}: ${label} is ${JSON.stringify(actual[0])}, expected ${JSON.stringify(expected)}`,
  );
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

function assertNoForbiddenOrigin(route, content) {
  const normalized = content.toLowerCase();
  for (const forbidden of forbiddenOrigins) {
    assert(
      !normalized.includes(forbidden),
      `${route}: search-facing output contains ${forbidden}`,
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

for (const [route, expected] of publicRoutes) {
  const head = await builtHead(route, expected.filename);
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
    new URL(canonicals[0]).href === expected.url,
    `${route}: canonical is ${canonicals[0]}, expected ${expected.url}`,
  );
  assert(
    new URL(openGraph[0]).href === expected.url,
    `${route}: og:url is ${openGraph[0]}, expected ${expected.url}`,
  );

  assertExactly(route, 'title', titleContents(head), expected.title);
  assertExactly(
    route,
    'description',
    metaContents(head, 'name', 'description'),
    expected.description,
  );
  assertExactly(
    route,
    'og:type',
    metaContents(head, 'property', 'og:type'),
    'website',
  );
  assertExactly(
    route,
    'og:site_name',
    metaContents(head, 'property', 'og:site_name'),
    'MindPulse by Northlight',
  );
  assertExactly(
    route,
    'og:title',
    metaContents(head, 'property', 'og:title'),
    expected.title,
  );
  assertExactly(
    route,
    'og:description',
    metaContents(head, 'property', 'og:description'),
    expected.description,
  );
  assertExactly(
    route,
    'og:image',
    metaContents(head, 'property', 'og:image'),
    socialImageUrl,
  );
  assertExactly(
    route,
    'og:image:width',
    metaContents(head, 'property', 'og:image:width'),
    '1200',
  );
  assertExactly(
    route,
    'og:image:height',
    metaContents(head, 'property', 'og:image:height'),
    '630',
  );
  assertExactly(
    route,
    'og:image:alt',
    metaContents(head, 'property', 'og:image:alt'),
    socialImageAlt,
  );
  assertExactly(
    route,
    'og:image:type',
    metaContents(head, 'property', 'og:image:type'),
    'image/png',
  );
  assertExactly(
    route,
    'twitter:card',
    metaContents(head, 'name', 'twitter:card'),
    'summary_large_image',
  );
  assertExactly(
    route,
    'twitter:title',
    metaContents(head, 'name', 'twitter:title'),
    expected.title,
  );
  assertExactly(
    route,
    'twitter:description',
    metaContents(head, 'name', 'twitter:description'),
    expected.description,
  );
  assertExactly(
    route,
    'twitter:image',
    metaContents(head, 'name', 'twitter:image'),
    socialImageUrl,
  );
  assertExactly(
    route,
    'twitter:image:alt',
    metaContents(head, 'name', 'twitter:image:alt'),
    socialImageAlt,
  );

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
    ...[...publicRoutes.values()].map(({ filename }) => filename),
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
assert(
  [...robotsDirectives.keys()].every((key) =>
    ['user-agent', 'allow', 'disallow', 'sitemap'].includes(key),
  ),
  'robots: contains an unexpected directive',
);
assertNoForbiddenOrigin('robots', robotsText);

const manifest = JSON.parse(
  await readFile(
    path.join(workerAssetsDirectory, 'manifest.webmanifest'),
    'utf8',
  ),
);
assert(
  manifest.description ===
    'An AI study and productivity workspace for students.',
  'manifest: production description is not the approved PR3 value',
);
assert(
  manifest.name === 'MindPulse' &&
    manifest.short_name === 'MindPulse' &&
    manifest.start_url === '/' &&
    manifest.display === 'standalone' &&
    manifest.background_color === '#f7f8f4' &&
    manifest.theme_color === '#56776f',
  'manifest: unrelated app behavior changed',
);
assert(
  JSON.stringify(manifest.icons) ===
    JSON.stringify([
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ]),
  'manifest: icons changed unexpectedly',
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
  `SEO build assertions passed for ${builtHtmlFiles.length} generated HTML documents (${publicRoutes.size} public and ${authRoutes.size} auth), sitemap.xml, robots.txt, manifest, and social preview.`,
);
