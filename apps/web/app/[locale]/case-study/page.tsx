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
  return publicPageMetadata('case-study', await resolveMarketingLocale(params));
}

export default async function CaseStudyPage({
  params,
}: {
  params: MarketingLocaleParams;
}) {
  return (
    <LocalizedPublicPage
      page="case-study"
      initialLanguage={await resolveMarketingLocale(params)}
    />
  );
}
