import type { Metadata } from 'next';
import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';
import {
  resolveMarketingLocale,
  type MarketingLocaleParams,
} from '@/lib/marketing-route';
import { publicPageMetadata } from '@/lib/marketing-seo';

export async function generateMetadata({
  params,
}: {
  params: MarketingLocaleParams;
}): Promise<Metadata> {
  return publicPageMetadata('beta', await resolveMarketingLocale(params));
}

export default async function BetaPage({
  params,
}: {
  params: MarketingLocaleParams;
}) {
  return (
    <LocalizedPublicPage
      page="beta"
      initialLanguage={await resolveMarketingLocale(params)}
    />
  );
}
