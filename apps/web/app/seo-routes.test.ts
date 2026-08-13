// @vitest-environment node
import { describe, expect, it } from 'vitest';
import nextConfig from '../next.config';
import robots from './robots';
import sitemap from './sitemap';

const locales = ['en', 'ru', 'kk', 'es'] as const;
const paths = ['', '/why', '/beta', '/case-study', '/impact', '/privacy'];
const expectedUrls = paths.flatMap((path) =>
  locales.map((locale) => `https://usemindpulse.com/${locale}${path}`),
);

function values(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

describe('SEO discovery routes', () => {
  it('publishes all 24 localized marketing URLs with reciprocal alternates', async () => {
    const entries = await sitemap();
    const urls = entries.map(({ url }) => new URL(url).href);

    expect(entries).toHaveLength(24);
    expect(new Set(urls)).toEqual(new Set(expectedUrls));
    expect(new Set(urls)).toHaveLength(entries.length);

    for (const entry of entries) {
      const url = new URL(entry.url);
      expect(url.protocol).toBe('https:');
      expect(url.host).toBe('usemindpulse.com');
      expect(url.search).toBe('');
      expect(url.hash).toBe('');
      expect(entry).not.toHaveProperty('lastModified');
      expect(entry).not.toHaveProperty('changeFrequency');
      expect(entry).not.toHaveProperty('priority');

      const suffix = url.pathname.replace(/^\/(?:en|ru|kk|es)/, '');
      expect(entry.alternates?.languages).toEqual({
        en: `https://usemindpulse.com/en${suffix}`,
        ru: `https://usemindpulse.com/ru${suffix}`,
        kk: `https://usemindpulse.com/kk${suffix}`,
        es: `https://usemindpulse.com/es${suffix}`,
        'x-default': `https://usemindpulse.com/en${suffix}`,
      });
    }
  });

  it('allows public crawling, excludes API discovery, and advertises the sitemap', async () => {
    const output = await robots();
    const rules = Array.isArray(output.rules) ? output.rules : [output.rules];

    expect(rules).toHaveLength(1);
    const rule = rules[0];
    expect(rule).toBeDefined();
    if (!rule) throw new Error('Expected one robots rule');

    expect(values(rule.userAgent)).toEqual(['*']);
    expect(values(rule.allow)).toEqual(['/']);
    expect(values(rule.disallow)).toEqual(['/api/']);
    expect(values(output.sitemap)).toEqual([
      'https://usemindpulse.com/sitemap.xml',
    ]);
    expect(output).not.toHaveProperty('host');
    expect(rule).not.toHaveProperty('crawlDelay');
  });

  it('permanently redirects legacy public URLs to their English equivalents', async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toEqual([
      { source: '/', destination: '/en', permanent: true },
      { source: '/why', destination: '/en/why', permanent: true },
      { source: '/beta', destination: '/en/beta', permanent: true },
      {
        source: '/case-study',
        destination: '/en/case-study',
        permanent: true,
      },
      { source: '/impact', destination: '/en/impact', permanent: true },
      { source: '/privacy', destination: '/en/privacy', permanent: true },
    ]);
  });
});
