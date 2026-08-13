import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing-page';
import {
  resolveMarketingLocale,
  type MarketingLocaleParams,
} from '@/lib/marketing-route';
import { landingMetadata } from '@/lib/marketing-seo';

export async function generateMetadata({
  params,
}: {
  params: MarketingLocaleParams;
}): Promise<Metadata> {
  return landingMetadata(await resolveMarketingLocale(params));
}

export default async function LocalizedHomePage({
  params,
}: {
  params: MarketingLocaleParams;
}) {
  const locale = await resolveMarketingLocale(params);
  return <LandingPage initialLanguage={locale} />;
}
