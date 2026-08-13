import type { Metadata } from 'next';

export const CANONICAL_ORIGIN = 'https://usemindpulse.com' as const;

export const INDEXABLE_MARKETING_PATHS = [
  '/',
  '/why',
  '/beta',
  '/case-study',
  '/impact',
  '/privacy',
] as const;

export type IndexableMarketingPath = (typeof INDEXABLE_MARKETING_PATHS)[number];

export const SOCIAL_PREVIEW_IMAGE_PATH =
  '/mindpulse-social-preview.png' as const;
export const SOCIAL_PREVIEW_IMAGE_ALT =
  'MindPulse by Northlight — AI study support for students' as const;

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
  pathname,
  title,
  description,
}: {
  pathname: IndexableMarketingPath;
  title: string;
  description: string;
}): Metadata {
  const url = absoluteSiteUrl(pathname);
  const socialImageUrl = absoluteSiteUrl(SOCIAL_PREVIEW_IMAGE_PATH);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
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
          alt: SOCIAL_PREVIEW_IMAGE_ALT,
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
          alt: SOCIAL_PREVIEW_IMAGE_ALT,
        },
      ],
    },
  };
}
