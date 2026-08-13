import { notFound } from 'next/navigation';
import { isMarketingLocale, type MarketingLocale } from './seo';

export type MarketingLocaleParams = Promise<{ locale: string }>;

export async function resolveMarketingLocale(
  params: MarketingLocaleParams,
): Promise<MarketingLocale> {
  const { locale } = await params;
  if (!isMarketingLocale(locale)) notFound();
  return locale;
}
