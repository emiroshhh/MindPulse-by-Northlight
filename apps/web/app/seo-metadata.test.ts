// @vitest-environment node
import { readFileSync } from 'node:fs';
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

const socialImageUrl = 'https://usemindpulse.com/mindpulse-social-preview.png';
const socialImageAlt =
  'MindPulse by Northlight — AI study support for students';

const publicRouteMetadata: Array<{
  pathname: string;
  expectedUrl: string;
  expectedTitle: string;
  expectedDescription: string;
  metadata: Metadata;
}> = [
  {
    pathname: '/',
    expectedUrl: 'https://usemindpulse.com/',
    expectedTitle: 'MindPulse — AI Study Assistant & Planner for Students',
    expectedDescription:
      'MindPulse is an AI study assistant for students that turns real tasks, deadlines, and stuck points into clear next steps, realistic plans, and recovery support.',
    metadata: homeMetadata,
  },
  {
    pathname: '/why',
    expectedUrl: 'https://usemindpulse.com/why',
    expectedTitle: 'Why MindPulse Was Built — Student-First AI Support',
    expectedDescription:
      'Why MindPulse was built: a student-first AI workspace designed to make studying, planning, and restarting after missed days more manageable.',
    metadata: whyMetadata,
  },
  {
    pathname: '/beta',
    expectedUrl: 'https://usemindpulse.com/beta',
    expectedTitle: 'MindPulse Student Beta — Test the AI Study Workspace',
    expectedDescription:
      'Try the MindPulse student beta on one real task, deadline, habit, goal, or planning problem, then share anonymous feedback about what helped.',
    metadata: betaMetadata,
  },
  {
    pathname: '/case-study',
    expectedUrl: 'https://usemindpulse.com/case-study',
    expectedTitle: 'MindPulse Case Study — Safety, Privacy & Architecture',
    expectedDescription:
      'A transparent case study of how MindPulse approaches AI student support, product design, safety, privacy, and its technical architecture.',
    metadata: caseStudyMetadata,
  },
  {
    pathname: '/impact',
    expectedUrl: 'https://usemindpulse.com/impact',
    expectedTitle: 'MindPulse Impact — Beta Goals & Measurement',
    expectedDescription:
      'How MindPulse measures beta impact through honest goals, anonymous usage signals, student feedback, and iteration without inflated claims.',
    metadata: impactMetadata,
  },
  {
    pathname: '/privacy',
    expectedUrl: 'https://usemindpulse.com/privacy',
    expectedTitle: 'MindPulse Privacy — How Student Data Is Handled',
    expectedDescription:
      'Plain-language details on what MindPulse stores for guests and accounts, how AI processing works, usage limits, feedback, retention, and deletion.',
    metadata: privacyMetadata,
  },
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

function absoluteTitle(metadata: Metadata): string | undefined {
  if (
    metadata.title !== null &&
    typeof metadata.title === 'object' &&
    'absolute' in metadata.title
  ) {
    return metadata.title.absolute;
  }
  return typeof metadata.title === 'string' ? metadata.title : undefined;
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
    '$pathname has complete route-specific search and social metadata',
    ({ expectedUrl, expectedTitle, expectedDescription, metadata }) => {
      expect(absoluteTitle(metadata)).toBe(expectedTitle);
      expect(metadata.description).toBe(expectedDescription);
      expect(normalizeMetadataUrl(metadata.alternates?.canonical)).toBe(
        expectedUrl,
      );
      expect(metadata.openGraph).toEqual({
        type: 'website',
        siteName: 'MindPulse by Northlight',
        title: expectedTitle,
        description: expectedDescription,
        url: expectedUrl,
        images: [
          {
            url: socialImageUrl,
            width: 1200,
            height: 630,
            alt: socialImageAlt,
            type: 'image/png',
          },
        ],
      });
      expect(metadata.twitter).toEqual({
        card: 'summary_large_image',
        title: expectedTitle,
        description: expectedDescription,
        images: [
          {
            url: socialImageUrl,
            width: 1200,
            height: 630,
            alt: socialImageAlt,
          },
        ],
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
        ...publicRouteMetadata.map(({ metadata }) => metadata),
        ...nonCanonicalRouteMetadata.map(([, metadata]) => metadata),
      ],
      (_key, value) => (value instanceof URL ? value.href : value),
    ).toLowerCase();

    for (const forbidden of [
      'http://localhost',
      'https://localhost',
      '127.0.0.1',
      'mindpulse.example',
      '.workers.dev',
      'www.usemindpulse.com',
      'http://usemindpulse.com',
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

  it('ships the approved manifest description without changing app behavior', () => {
    const manifest = JSON.parse(
      readFileSync(
        new URL('../public/manifest.webmanifest', import.meta.url),
        'utf8',
      ),
    );

    expect(manifest).toMatchObject({
      name: 'MindPulse',
      short_name: 'MindPulse',
      description: 'An AI study and productivity workspace for students.',
      start_url: '/',
      display: 'standalone',
      background_color: '#f7f8f4',
      theme_color: '#56776f',
    });
    expect(manifest.icons).toEqual([
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ]);
  });

  it('ships an exact 1200 by 630 PNG social preview', () => {
    const image = readFileSync(
      new URL('../public/mindpulse-social-preview.png', import.meta.url),
    );
    expect(image.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect(image.readUInt32BE(16)).toBe(1200);
    expect(image.readUInt32BE(20)).toBe(630);
  });
});
