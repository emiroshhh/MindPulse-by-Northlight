// @vitest-environment node
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { describe, expect, it } from 'vitest';
import {
  acquisitionPageMetadata,
  brandedMarketingTitle,
  LANDING_TITLES,
  landingMetadata,
  publicPageMetadata,
} from '@/lib/marketing-seo';
import {
  acquisitionPageCopyFor,
  type AcquisitionPageId,
} from '@/lib/mindpulse/acquisition-page-i18n';
import { landingCopyFor } from '@/lib/mindpulse/marketing-i18n';
import {
  publicPageCopyFor,
  type PublicPageId,
} from '@/lib/mindpulse/public-page-i18n';
import {
  absoluteSiteUrl,
  languageAlternates,
  localizedMarketingPath,
  SOCIAL_PREVIEW_IMAGE_ALTS,
  SUPPORTED_MARKETING_LOCALES,
  type IndexableMarketingPath,
  type MarketingLocale,
} from '@/lib/seo';

type RouteCase = {
  locale: MarketingLocale;
  pathname: IndexableMarketingPath;
  metadata: Metadata;
  title: string;
  description: string;
  h1: string;
  intro: string;
};

const publicPages: PublicPageId[] = [
  'why',
  'beta',
  'case-study',
  'impact',
  'privacy',
];
const publicPaths: Record<PublicPageId, IndexableMarketingPath> = {
  why: '/why',
  beta: '/beta',
  'case-study': '/case-study',
  impact: '/impact',
  privacy: '/privacy',
};
const acquisitionPages: AcquisitionPageId[] = [
  'ai-study-planner',
  'catch-up-on-schoolwork',
];
const acquisitionPaths: Record<AcquisitionPageId, IndexableMarketingPath> = {
  'ai-study-planner': '/ai-study-planner',
  'catch-up-on-schoolwork': '/catch-up-on-schoolwork',
};

const cases: RouteCase[] = SUPPORTED_MARKETING_LOCALES.flatMap((locale) => {
  const landing = landingCopyFor(locale);
  const routes: RouteCase[] = [
    {
      locale,
      pathname: '/',
      metadata: landingMetadata(locale),
      title: LANDING_TITLES[locale],
      description: landing.heroSubtitle,
      h1: `${landing.heroTitleLead} ${landing.heroTitleAccent}`,
      intro: landing.heroSubtitle,
    },
  ];

  for (const page of publicPages) {
    const copy = publicPageCopyFor(page, locale);
    routes.push({
      locale,
      pathname: publicPaths[page],
      metadata: publicPageMetadata(page, locale),
      title: brandedMarketingTitle(copy.metadataTitle),
      description: copy.metadataDescription,
      h1: copy.title,
      intro: copy.intro,
    });
  }

  for (const page of acquisitionPages) {
    const copy = acquisitionPageCopyFor(page, locale);
    routes.push({
      locale,
      pathname: acquisitionPaths[page],
      metadata: acquisitionPageMetadata(page, locale),
      title: copy.metadataTitle,
      description: copy.metadataDescription,
      h1: copy.title,
      intro: copy.intro,
    });
  }

  return routes;
});

function metadataTitle(metadata: Metadata): string | undefined {
  if (
    metadata.title &&
    typeof metadata.title === 'object' &&
    'absolute' in metadata.title
  ) {
    return metadata.title.absolute;
  }
  return typeof metadata.title === 'string' ? metadata.title : undefined;
}

function robotsAllowsIndexing(metadata: Metadata) {
  const robots = metadata.robots;
  if (!robots || typeof robots === 'string') return true;
  return robots.index !== false;
}

function expectSameLanguage(locale: MarketingLocale, text: string) {
  if (locale === 'en') {
    expect(text).not.toMatch(/[ӘҒҚҢӨҰҮҺІәғқңөұүһі]/);
    return;
  }
  if (locale === 'ru') {
    expect(text).toMatch(/[А-Яа-яЁё]/);
    return;
  }
  if (locale === 'kk') {
    expect(text).toMatch(/[ӘҒҚҢӨҰҮҺІәғқңөұүһі]/);
    return;
  }
  expect(text).toMatch(/[áéíóúñ¿ÁÉÍÓÚÑ]/);
}

describe('all localized indexable routes', () => {
  it('covers 8 pages in each of 4 languages', () => {
    expect(cases).toHaveLength(32);
    expect(
      new Set(
        cases.map(({ locale, pathname }) =>
          localizedMarketingPath(locale, pathname),
        ),
      ).size,
    ).toBe(32);
  });

  it.each(cases)(
    '$locale$pathname has complete self-referential search and social metadata',
    ({ locale, pathname, metadata, title, description }) => {
      const route = localizedMarketingPath(locale, pathname);
      const url = absoluteSiteUrl(route);
      const serialized = JSON.stringify(metadata).toLowerCase();

      expect(metadataTitle(metadata)).toBe(title);
      expect(metadata.description).toBe(description);
      expect(metadata.alternates?.canonical).toBe(url);
      expect(metadata.alternates?.languages).toEqual(
        languageAlternates(pathname),
      );
      expect(metadata.alternates?.languages?.['x-default']).toBe(
        absoluteSiteUrl(localizedMarketingPath('en', pathname)),
      );
      expect(metadata.openGraph).toMatchObject({
        type: 'website',
        siteName: 'MindPulse by Northlight',
        title,
        description,
        url,
        images: [
          {
            url: 'https://usemindpulse.com/mindpulse-social-preview.png',
            width: 1200,
            height: 630,
            alt: SOCIAL_PREVIEW_IMAGE_ALTS[locale],
            type: 'image/png',
          },
        ],
      });
      expect(metadata.twitter).toMatchObject({
        card: 'summary_large_image',
        title,
        description,
        images: [
          {
            url: 'https://usemindpulse.com/mindpulse-social-preview.png',
            width: 1200,
            height: 630,
            alt: SOCIAL_PREVIEW_IMAGE_ALTS[locale],
          },
        ],
      });
      expect(robotsAllowsIndexing(metadata)).toBe(true);
      expect(metadata.keywords).toBeUndefined();
      for (const forbidden of [
        'http://localhost',
        '127.0.0.1',
        '.workers.dev',
        'www.usemindpulse.com',
        'http://usemindpulse.com',
      ]) {
        expect(serialized).not.toContain(forbidden);
      }
    },
  );

  it.each(cases)(
    '$locale$pathname has non-empty same-language visible purpose copy',
    ({ locale, h1, intro }) => {
      expect(h1.trim().length).toBeGreaterThan(20);
      expect(intro.trim().length).toBeGreaterThan(80);
      expectSameLanguage(locale, `${h1} ${intro}`);
    },
  );

  it.each([
    '/',
    '/why',
    '/beta',
    '/case-study',
    '/impact',
    '/privacy',
    '/ai-study-planner',
    '/catch-up-on-schoolwork',
  ] as IndexableMarketingPath[])(
    '%s has distinct copy in all languages',
    (pathname) => {
      const routeCases = cases.filter((entry) => entry.pathname === pathname);
      expect(new Set(routeCases.map(({ title }) => title)).size).toBe(4);
      expect(
        new Set(routeCases.map(({ description }) => description)).size,
      ).toBe(4);
      expect(new Set(routeCases.map(({ h1 }) => h1)).size).toBe(4);
    },
  );

  it.each(acquisitionPages)(
    '%s is a substantial guide with examples, limits, and visible FAQs',
    (page) => {
      for (const locale of SUPPORTED_MARKETING_LOCALES) {
        const copy = acquisitionPageCopyFor(page, locale);
        expect(copy.steps.length).toBeGreaterThanOrEqual(5);
        expect(copy.exampleItems.length).toBeGreaterThanOrEqual(3);
        expect(copy.limits.length).toBeGreaterThanOrEqual(4);
        expect(copy.faqs.length).toBeGreaterThanOrEqual(4);
        expect(
          copy.faqs.every(({ question, answer }) => question && answer),
        ).toBe(true);
      }
    },
  );

  it('uses concrete static route files for every acquisition locale', () => {
    for (const locale of SUPPORTED_MARKETING_LOCALES) {
      for (const page of acquisitionPages) {
        expect(
          existsSync(path.join(process.cwd(), 'app', locale, page, 'page.tsx')),
        ).toBe(true);
      }
    }
  });
});
