import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { LanguageProvider } from '@/components/language-provider';
import { LocalizedSkipLink } from '@/components/localized-skip-link';
import { ServiceWorkerRegister } from '@/components/service-worker-register';
import {
  CANONICAL_ORIGIN,
  DEFAULT_OPEN_GRAPH,
  DOCUMENT_LANGUAGE_HEADER,
  isMarketingLocale,
  type MarketingLocale,
} from '@/lib/seo';

const MARKETING_SKIP_LINKS: Record<MarketingLocale, string> = {
  en: 'Skip to content',
  ru: 'Перейти к содержимому',
  kk: 'Мазмұнға өту',
  es: 'Ir al contenido',
};

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_ORIGIN),
  title: { default: 'MindPulse', template: '%s · MindPulse' },
  description:
    'An AI study and self-growth assistant for planning, motivation, habits, goals, and learning.',
  applicationName: 'MindPulse',
  openGraph: DEFAULT_OPEN_GRAPH,
  twitter: {
    card: 'summary',
    title: 'MindPulse by Northlight',
    description: 'A calmer student workspace for messy days.',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'MindPulse' },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f8f4' },
    { media: '(prefers-color-scheme: dark)', color: '#17201e' },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const requestedLanguage = requestHeaders.get(DOCUMENT_LANGUAGE_HEADER) ?? '';
  const marketingLanguage = isMarketingLocale(requestedLanguage)
    ? requestedLanguage
    : undefined;
  const documentLanguage = marketingLanguage ?? 'en';

  if (marketingLanguage) {
    return (
      <html lang={documentLanguage}>
        <body>
          <a
            href="#main-content"
            className="skip-link"
            lang={marketingLanguage}
          >
            {MARKETING_SKIP_LINKS[marketingLanguage]}
          </a>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <LocalizedSkipLink />
          {children}
          <ServiceWorkerRegister />
        </LanguageProvider>
      </body>
    </html>
  );
}
