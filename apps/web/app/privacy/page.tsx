import type { Metadata } from 'next';
import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'Plain-language privacy information for the MindPulse student beta.',
};

export default function PrivacyPage() {
  return <LocalizedPublicPage page="privacy" />;
}
