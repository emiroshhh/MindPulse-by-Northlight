import type { Metadata } from 'next';

export const CANONICAL_ORIGIN = 'https://usemindpulse.com' as const;
export const DOCUMENT_LANGUAGE_HEADER = 'x-mindpulse-document-language';

export const SUPPORTED_MARKETING_LOCALES = ['en', 'ru', 'kk', 'es'] as const;
export type MarketingLocale = (typeof SUPPORTED_MARKETING_LOCALES)[number];

export const INDEXABLE_MARKETING_PATHS = [
  '/',
  '/why',
  '/beta',
  '/case-study',
  '/impact',
  '/privacy',
  '/ai-study-planner',
  '/catch-up-on-schoolwork',
] as const;

export type IndexableMarketingPath = (typeof INDEXABLE_MARKETING_PATHS)[number];

export function isMarketingLocale(value: string): value is MarketingLocale {
  return SUPPORTED_MARKETING_LOCALES.some((locale) => locale === value);
}

export function marketingLocaleForPathname(
  pathname: string,
): MarketingLocale | undefined {
  const normalized =
    pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

  return SUPPORTED_MARKETING_LOCALES.find((locale) =>
    INDEXABLE_MARKETING_PATHS.some(
      (marketingPath) =>
        normalized === localizedMarketingPath(locale, marketingPath),
    ),
  );
}

export function localizedMarketingPath(
  locale: MarketingLocale,
  pathname: IndexableMarketingPath,
): `/${MarketingLocale}${string}` {
  return `/${locale}${pathname === '/' ? '' : pathname}`;
}

export function replaceMarketingLocale(
  pathname: string,
  locale: MarketingLocale,
): string {
  const segments = pathname.split('/');
  if (segments[1] && isMarketingLocale(segments[1])) {
    segments[1] = locale;
    return segments.join('/') || `/${locale}`;
  }
  return localizedMarketingPath(locale, '/');
}

export function languageAlternates(pathname: IndexableMarketingPath) {
  const languages = Object.fromEntries(
    SUPPORTED_MARKETING_LOCALES.map((locale) => [
      locale,
      absoluteSiteUrl(localizedMarketingPath(locale, pathname)),
    ]),
  ) as Record<MarketingLocale, string>;

  return {
    ...languages,
    'x-default': languages.en,
  };
}

export const SOCIAL_PREVIEW_IMAGE_PATH =
  '/mindpulse-social-preview.png' as const;
export const SOCIAL_PREVIEW_IMAGE_ALT =
  'MindPulse by Northlight — AI study support for students' as const;
export const SOCIAL_PREVIEW_IMAGE_ALTS: Record<MarketingLocale, string> = {
  en: SOCIAL_PREVIEW_IMAGE_ALT,
  ru: 'MindPulse by Northlight — ИИ-помощь студентам в учёбе',
  kk: 'MindPulse by Northlight — студенттерге оқуға арналған ЖИ көмегі',
  es: 'MindPulse by Northlight — apoyo al estudio con IA para estudiantes',
};

export const DEFAULT_OPEN_GRAPH = {
  type: 'website',
  siteName: 'MindPulse by Northlight',
  title: 'MindPulse by Northlight',
  description: 'A calmer student workspace for messy days.',
} satisfies NonNullable<Metadata['openGraph']>;

export function absoluteSiteUrl(pathname: `/${string}`): string {
  return new URL(pathname, CANONICAL_ORIGIN).toString();
}

export function createPublicPageMetadata({
  locale,
  pathname,
  title,
  description,
}: {
  locale: MarketingLocale;
  pathname: IndexableMarketingPath;
  title: string;
  description: string;
}): Metadata {
  const url = absoluteSiteUrl(localizedMarketingPath(locale, pathname));
  const socialImageUrl = absoluteSiteUrl(SOCIAL_PREVIEW_IMAGE_PATH);
  const socialImageAlt = SOCIAL_PREVIEW_IMAGE_ALTS[locale];

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(pathname),
    },
    openGraph: {
      type: 'website',
      siteName: 'MindPulse by Northlight',
      title,
      description,
      url,
      images: [
        {
          url: socialImageUrl,
          width: 1200,
          height: 630,
          alt: socialImageAlt,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        {
          url: socialImageUrl,
          width: 1200,
          height: 630,
          alt: socialImageAlt,
        },
      ],
    },
  };
}
