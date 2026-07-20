import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/components/language-provider';
import { LocalizedSkipLink } from '@/components/localized-skip-link';
import { ServiceWorkerRegister } from '@/components/service-worker-register';

export const metadata: Metadata = {
  title: { default: 'MindPulse', template: '%s · MindPulse' },
  description:
    'An AI study and self-growth assistant for planning, motivation, habits, goals, and learning.',
  applicationName: 'MindPulse',
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
