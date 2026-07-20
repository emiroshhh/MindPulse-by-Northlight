import type { Metadata } from 'next';
import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';

export const metadata: Metadata = {
  title: 'Case study',
  description:
    'MindPulse product, safety, privacy, and technical architecture case study.',
};

export default function CaseStudyPage() {
  return <LocalizedPublicPage page="case-study" />;
}
