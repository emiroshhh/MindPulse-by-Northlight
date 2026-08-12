// @vitest-environment node
import { describe, expect, it } from 'vitest';
import robots from './robots';
import sitemap from './sitemap';

const expectedUrls = [
  'https://usemindpulse.com/',
  'https://usemindpulse.com/why',
  'https://usemindpulse.com/beta',
  'https://usemindpulse.com/case-study',
  'https://usemindpulse.com/impact',
  'https://usemindpulse.com/privacy',
];

function values(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

describe('SEO discovery routes', () => {
  it('publishes exactly the six approved marketing URLs', async () => {
    const entries = await sitemap();
    const urls = entries.map(({ url }) => new URL(url).href);

    expect(entries).toHaveLength(6);
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
});
