import { readFile } from 'node:fs/promises';

const publicRoutes = new Map([
  ['/', 'index.html'],
  ['/why', 'why.html'],
  ['/beta', 'beta.html'],
  ['/case-study', 'case-study.html'],
  ['/impact', 'impact.html'],
  ['/privacy', 'privacy.html'],
]);

const authRoutes = new Map([
  ['/login', 'login.html'],
  ['/signup', 'signup.html'],
]);

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

function metaContent(head, name) {
  for (const tag of head.match(/<meta\b[^>]*>/gi) ?? []) {
    const nameValue = tag.match(/\bname=["']([^"']*)["']/i)?.[1];
    if (nameValue?.toLowerCase() !== name.toLowerCase()) continue;
    return tag.match(/\bcontent=["']([^"']*)["']/i)?.[1] ?? '';
  }
  return undefined;
}

function assertNoOriginDependentSeo(route, head) {
  assert(
    !/<link\b[^>]*\brel=["']canonical["']/i.test(head),
    `${route}: unexpected canonical link`,
  );
  assert(
    !/<meta\b[^>]*\bproperty=["']og:url["']/i.test(head),
    `${route}: unexpected Open Graph URL`,
  );

  const normalized = head.toLowerCase();
  for (const forbidden of forbiddenOrigins) {
    assert(
      !normalized.includes(forbidden),
      `${route}: search-facing metadata contains ${forbidden}`,
    );
  }
}

async function builtHead(route, filename) {
  const url = new URL(`../.next/server/app/${filename}`, import.meta.url);
  const html = await readFile(url, 'utf8');
  return headFor(route, html);
}

for (const [route, filename] of publicRoutes) {
  const head = await builtHead(route, filename);
  assertNoOriginDependentSeo(route, head);
  const robots = metaContent(head, 'robots');
  assert(
    !robots
      ?.toLowerCase()
      .split(/[,\s]+/)
      .includes('noindex'),
    `${route}: public route unexpectedly renders noindex`,
  );
}

for (const [route, filename] of authRoutes) {
  const head = await builtHead(route, filename);
  assertNoOriginDependentSeo(route, head);
  const tokens =
    metaContent(head, 'robots')
      ?.toLowerCase()
      .split(/[,\s]+/)
      .filter(Boolean) ?? [];
  assert(
    tokens.length === 2 &&
      tokens.includes('noindex') &&
      tokens.includes('follow'),
    `${route}: expected robots content "noindex, follow"`,
  );
}

console.log(
  `SEO build assertions passed for ${publicRoutes.size + authRoutes.size} prerendered routes.`,
);
