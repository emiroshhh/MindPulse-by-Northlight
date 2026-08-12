// @vitest-environment node
import type { Metadata } from 'next';
import { describe, expect, it } from 'vitest';
import { metadata as rootMetadata } from './layout';
import { metadata as homeMetadata } from './page';
import { metadata as appMetadata } from './app/page';
import { metadata as betaMetadata } from './beta/page';
import { metadata as caseStudyMetadata } from './case-study/page';
import { metadata as goalsMetadata } from './goals/page';
import { metadata as habitsMetadata } from './habits/page';
import { metadata as impactMetadata } from './impact/page';
import { metadata as loginMetadata } from './login/page';
import { metadata as motivationMetadata } from './motivation/page';
import { metadata as plannerMetadata } from './planner/page';
import { metadata as privacyMetadata } from './privacy/page';
import { metadata as recoveryMetadata } from './recovery/page';
import { metadata as reflectionMetadata } from './reflection/page';
import { metadata as signupMetadata } from './signup/page';
import { metadata as studyMetadata } from './study/page';
import { metadata as whyMetadata } from './why/page';

const publicRouteMetadata: Array<[string, string, Metadata]> = [
  ['/', 'https://usemindpulse.com/', homeMetadata],
  ['/why', 'https://usemindpulse.com/why', whyMetadata],
  ['/beta', 'https://usemindpulse.com/beta', betaMetadata],
  ['/case-study', 'https://usemindpulse.com/case-study', caseStudyMetadata],
  ['/impact', 'https://usemindpulse.com/impact', impactMetadata],
  ['/privacy', 'https://usemindpulse.com/privacy', privacyMetadata],
];

const nonCanonicalRouteMetadata: Array<[string, Metadata]> = [
  ['/app', appMetadata],
  ['/login', loginMetadata],
  ['/signup', signupMetadata],
  ['/goals', goalsMetadata],
  ['/habits', habitsMetadata],
  ['/motivation', motivationMetadata],
  ['/planner', plannerMetadata],
  ['/recovery', recoveryMetadata],
  ['/reflection', reflectionMetadata],
  ['/study', studyMetadata],
];

function normalizeMetadataUrl(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;

  let candidate: unknown = value;
  if (
    candidate !== null &&
    typeof candidate === 'object' &&
    !(candidate instanceof URL) &&
    'url' in candidate
  ) {
    candidate = candidate.url;
  }

  if (typeof candidate !== 'string' && !(candidate instanceof URL)) {
    throw new TypeError('Expected metadata URL to be a string or URL');
  }

  return new URL(candidate, rootMetadata.metadataBase ?? undefined).href;
}

function expectIndexableCandidate(metadata: Metadata) {
  const robots = metadata.robots ?? rootMetadata.robots;
  if (typeof robots === 'object' && robots !== null) {
    expect(robots.index).not.toBe(false);
    if (typeof robots.googleBot === 'object') {
      expect(robots.googleBot.index).not.toBe(false);
    } else if (typeof robots.googleBot === 'string') {
      const tokens = robots.googleBot.toLowerCase().split(/[,\s]+/);
      expect(tokens).not.toContain('noindex');
      expect(tokens).not.toContain('none');
    }
  } else if (typeof robots === 'string') {
    const tokens = robots.toLowerCase().split(/[,\s]+/);
    expect(tokens).not.toContain('noindex');
    expect(tokens).not.toContain('none');
  }
}

describe('production SEO metadata', () => {
  it('uses the verified origin as metadataBase without inherited URL metadata', () => {
    expect(rootMetadata.metadataBase?.href).toBe('https://usemindpulse.com/');
    expect(rootMetadata.alternates?.canonical).toBeUndefined();
    expect(rootMetadata.openGraph?.url).toBeUndefined();
  });

  it.each(publicRouteMetadata)(
    '%s uses one route-correct canonical and Open Graph URL',
    (_pathname, expectedUrl, metadata) => {
      expect(normalizeMetadataUrl(metadata.alternates?.canonical)).toBe(
        expectedUrl,
      );
      expect(normalizeMetadataUrl(metadata.openGraph?.url)).toBe(expectedUrl);
      expect(metadata.openGraph).toMatchObject({
        type: 'website',
        siteName: 'MindPulse by Northlight',
        title: 'MindPulse by Northlight',
        description: 'A calmer student workspace for messy days.',
      });
      expectIndexableCandidate(metadata);
    },
  );

  it.each(nonCanonicalRouteMetadata)(
    '%s does not receive public canonical or Open Graph URL metadata',
    (_pathname, metadata) => {
      expect(metadata.alternates?.canonical).toBeUndefined();
      expect(metadata.openGraph?.url).toBeUndefined();
    },
  );

  it('contains no forbidden host in search-facing URL metadata', () => {
    const serialized = JSON.stringify(
      [
        rootMetadata,
        ...publicRouteMetadata.map(([, , metadata]) => metadata),
        ...nonCanonicalRouteMetadata.map(([, metadata]) => metadata),
      ],
      (_key, value) => (value instanceof URL ? value.href : value),
    ).toLowerCase();

    for (const forbidden of [
      'http://localhost',
      'https://localhost',
      '127.0.0.1',
      'mindpulse.example',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it.each([
    ['/app', appMetadata],
    ['/login', loginMetadata],
    ['/signup', signupMetadata],
  ])('%s explicitly uses noindex, follow', (_pathname, metadata) => {
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});
