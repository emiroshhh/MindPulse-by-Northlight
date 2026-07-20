import type { Metadata } from 'next';
import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';

export const metadata: Metadata = {
  title: 'Impact',
  description: 'Honest beta goals and impact measurement for MindPulse.',
};

export default function ImpactPage() {
  return <LocalizedPublicPage page="impact" />;
}
