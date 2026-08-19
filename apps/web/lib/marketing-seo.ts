import type { Metadata } from 'next';
import { landingCopyFor } from './mindpulse/marketing-i18n';
import {
  acquisitionPageCopyFor,
  type AcquisitionPageId,
} from './mindpulse/acquisition-page-i18n';
import {
  publicPageCopyFor,
  type PublicPageId,
} from './mindpulse/public-page-i18n';
import {
  createPublicPageMetadata,
  type IndexableMarketingPath,
  type MarketingLocale,
} from './seo';

export const LANDING_TITLES: Record<MarketingLocale, string> = {
  en: 'MindPulse — AI Study Assistant & Planner for Students',
  ru: 'MindPulse — ИИ-помощник для учёбы и планирования',
  kk: 'MindPulse — Оқуға және жоспарлауға арналған ЖИ көмекші',
  es: 'MindPulse — Asistente de estudio y planificación con IA',
};

const PUBLIC_PAGE_PATHS: Record<PublicPageId, IndexableMarketingPath> = {
  why: '/why',
  beta: '/beta',
  'case-study': '/case-study',
  impact: '/impact',
  privacy: '/privacy',
};

export function brandedMarketingTitle(title: string): string {
  return title.includes('MindPulse') ? title : `${title} · MindPulse`;
}

const ACQUISITION_PAGE_PATHS: Record<
  AcquisitionPageId,
  IndexableMarketingPath
> = {
  'ai-study-planner': '/ai-study-planner',
  'catch-up-on-schoolwork': '/catch-up-on-schoolwork',
};

export function landingMetadata(locale: MarketingLocale): Metadata {
  return createPublicPageMetadata({
    locale,
    pathname: '/',
    title: LANDING_TITLES[locale],
    description: landingCopyFor(locale).heroSubtitle,
  });
}

export function publicPageMetadata(
  page: PublicPageId,
  locale: MarketingLocale,
): Metadata {
  const copy = publicPageCopyFor(page, locale);
  return createPublicPageMetadata({
    locale,
    pathname: PUBLIC_PAGE_PATHS[page],
    title: brandedMarketingTitle(copy.metadataTitle),
    description: copy.metadataDescription,
  });
}

export function acquisitionPageMetadata(
  page: AcquisitionPageId,
  locale: MarketingLocale,
): Metadata {
  const copy = acquisitionPageCopyFor(page, locale);
  return createPublicPageMetadata({
    locale,
    pathname: ACQUISITION_PAGE_PATHS[page],
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}
