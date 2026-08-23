import { LandingPage } from '@/components/landing-page';
import { LocalizedAcquisitionPage } from '@/components/mindpulse/localized-acquisition-page';
import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';
import { JsonLd } from '@/components/mindpulse/json-ld';
import {
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
  breadcrumbSchema,
} from '@/lib/mindpulse/structured-data';
import {
  acquisitionPageCopyFor,
  type AcquisitionPageId,
} from '@/lib/mindpulse/acquisition-page-i18n';
import type { PublicPageId } from '@/lib/mindpulse/public-page-i18n';
import {
  absoluteSiteUrl,
  localizedMarketingPath,
  type MarketingLocale,
  type IndexableMarketingPath,
} from '@/lib/seo';

const ACQUISITION_PATH_MAP: Record<AcquisitionPageId, IndexableMarketingPath> =
  {
    'ai-study-planner': '/ai-study-planner',
    'catch-up-on-schoolwork': '/catch-up-on-schoolwork',
  };

export function StaticLandingPage({ locale }: { locale: MarketingLocale }) {
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          websiteSchema(),
          softwareApplicationSchema(),
        ]}
      />
      <LandingPage initialLanguage={locale} />
    </>
  );
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
  const copy = acquisitionPageCopyFor(page, locale);
  const marketingPath = ACQUISITION_PATH_MAP[page];

  const items = [
    {
      name: 'MindPulse',
      url: absoluteSiteUrl(localizedMarketingPath(locale, '/')),
    },
    {
      name: copy.title,
      url: absoluteSiteUrl(localizedMarketingPath(locale, marketingPath)),
    },
  ];
  return (
    <>
      <JsonLd data={breadcrumbSchema(items)} />
      <LocalizedAcquisitionPage page={page} locale={locale} />
    </>
  );
}
