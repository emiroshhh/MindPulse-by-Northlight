// @vitest-environment node
import type { Metadata } from 'next';
import { describe, expect, it } from 'vitest';
import { metadata as rootMetadata } from './layout';
import { metadata as appMetadata } from './app/page';
import { metadata as betaMetadata } from './beta/page';
import { metadata as caseStudyMetadata } from './case-study/page';
import { metadata as impactMetadata } from './impact/page';
import { metadata as loginMetadata } from './login/page';
import { metadata as privacyMetadata } from './privacy/page';
import { metadata as signupMetadata } from './signup/page';
import { metadata as whyMetadata } from './why/page';

const publicRouteMetadata: Array<[string, Metadata | undefined]> = [
  ['/', undefined],
  ['/why', whyMetadata],
  ['/beta', betaMetadata],
  ['/case-study', caseStudyMetadata],
  ['/impact', impactMetadata],
  ['/privacy', privacyMetadata],
];

function expectIndexableCandidate(metadata: Metadata | undefined) {
  const robots = metadata?.robots ?? rootMetadata.robots;
  if (typeof robots === 'object' && robots !== null) {
    expect(robots.index).not.toBe(false);
  } else if (typeof robots === 'string') {
    expect(robots.toLowerCase().split(/[,\s]+/)).not.toContain('noindex');
  }
}

function expectNoCanonical(metadata: Metadata | undefined) {
  expect(rootMetadata.alternates?.canonical).toBeUndefined();
  expect(metadata?.alternates?.canonical).toBeUndefined();
}

describe('production SEO metadata containment', () => {
  it('does not manufacture an origin or force inherited URL metadata', () => {
    expect(rootMetadata.metadataBase).toBeUndefined();
    expect(rootMetadata.alternates?.canonical).toBeUndefined();
    expect(rootMetadata.openGraph?.url).toBeUndefined();
  });

  it('contains no forbidden production origin in search-facing metadata', () => {
    const actualMetadata = [
      rootMetadata,
      ...publicRouteMetadata.map(([, metadata]) => metadata),
      appMetadata,
      loginMetadata,
      signupMetadata,
    ];
    const serialized = JSON.stringify(actualMetadata, (_key, value) =>
      value instanceof URL ? value.toString() : value,
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

  it.each(publicRouteMetadata)(
    '%s remains an indexable candidate without a forced canonical',
    (_pathname, metadata) => {
      expectIndexableCandidate(metadata);
      expectNoCanonical(metadata);
    },
  );

  it.each([
    ['/app', appMetadata],
    ['/login', loginMetadata],
    ['/signup', signupMetadata],
  ])('%s explicitly uses noindex, follow', (_pathname, metadata) => {
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});
