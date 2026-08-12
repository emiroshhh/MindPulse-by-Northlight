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
  title?: string;
  description: string;
}): Metadata {
  const url = absoluteSiteUrl(pathname);

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: url },
    openGraph: { ...DEFAULT_OPEN_GRAPH, url },
  };
}
