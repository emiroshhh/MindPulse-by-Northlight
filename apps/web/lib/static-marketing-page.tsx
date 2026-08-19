import { LandingPage } from '@/components/landing-page';
import { LocalizedAcquisitionPage } from '@/components/mindpulse/localized-acquisition-page';
import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';
import type { AcquisitionPageId } from '@/lib/mindpulse/acquisition-page-i18n';
import type { PublicPageId } from '@/lib/mindpulse/public-page-i18n';
import type { MarketingLocale } from '@/lib/seo';

export function StaticLandingPage({ locale }: { locale: MarketingLocale }) {
  return <LandingPage initialLanguage={locale} />;
}

export function StaticPublicPage({
  locale,
  page,
}: {
  locale: MarketingLocale;
  page: PublicPageId;
}) {
  return <LocalizedPublicPage page={page} initialLanguage={locale} />;
}

export function StaticAcquisitionPage({
  locale,
  page,
}: {
  locale: MarketingLocale;
  page: AcquisitionPageId;
}) {
  return <LocalizedAcquisitionPage page={page} locale={locale} />;
}
