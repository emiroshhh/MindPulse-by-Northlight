import type { ReactNode } from 'react';
import {
  resolveMarketingLocale,
  type MarketingLocaleParams,
} from '@/lib/marketing-route';
import { SUPPORTED_MARKETING_LOCALES } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_MARKETING_LOCALES.map((locale) => ({ locale }));
}

export default async function MarketingLocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: MarketingLocaleParams;
}) {
  await resolveMarketingLocale(params);
  return children;
}
