import type { Metadata } from 'next';
import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';

export const metadata: Metadata = {
  title: 'Beta testing',
  description: 'A practical guide to testing the free MindPulse student beta.',
};

export default function BetaPage() {
  return <LocalizedPublicPage page="beta" />;
}
