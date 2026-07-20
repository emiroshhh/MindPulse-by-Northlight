import type { Metadata } from 'next';
import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';

export const metadata: Metadata = {
  title: 'Why I built this',
  description: 'The student problem and product principles behind MindPulse.',
};

export default function WhyPage() {
  return <LocalizedPublicPage page="why" />;
}
