// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { localizedMarketingPath } from '../seo';

const webRoot = fileURLToPath(new URL('../../', import.meta.url));
const sourceFiles = [
  'app/page.tsx',
  'app/beta/page.tsx',
  'app/case-study/page.tsx',
  'app/impact/page.tsx',
  'app/privacy/page.tsx',
  'app/why/page.tsx',
  'components/mindpulse/site-footer.tsx',
];

describe('public internal links', () => {
  it('point to implemented app routes and never use a dead hash destination', () => {
    const routes = new Set<string>();

    for (const sourceFile of sourceFiles) {
      const source = readFileSync(`${webRoot}/${sourceFile}`, 'utf8');
      expect(source).not.toContain('href="#"');
      for (const match of source.matchAll(/href="(\/[a-z-]*)"/g)) {
        routes.add(match[1]!);
      }
    }

    for (const route of routes) {
      const routeName = route === '/' ? '' : route.slice(1);
      const pagePath = routeName
        ? `${webRoot}/app/${routeName}/page.tsx`
        : `${webRoot}/app/page.tsx`;
      const routePath = `${webRoot}/app/${routeName}/route.ts`;
      expect(
        existsSync(pagePath) || existsSync(routePath),
        `Missing implementation for ${route}`,
      ).toBe(true);
    }

    const localizedPageFiles = [
      'page.tsx',
      'why/page.tsx',
      'beta/page.tsx',
      'case-study/page.tsx',
      'impact/page.tsx',
      'privacy/page.tsx',
    ];
    for (const locale of ['en', 'ru', 'kk', 'es']) {
      for (const pageFile of localizedPageFiles) {
        expect(existsSync(`${webRoot}/app/${locale}/${pageFile}`)).toBe(true);
      }
    }
    expect(localizedMarketingPath('es', '/case-study')).toBe('/es/case-study');
  });
});
