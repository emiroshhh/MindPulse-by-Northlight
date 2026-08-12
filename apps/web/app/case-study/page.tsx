import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';
import { createPublicPageMetadata } from '@/lib/seo';

export const metadata = createPublicPageMetadata({
  pathname: '/case-study',
  title: 'Case study',
  description:
    'MindPulse product, safety, privacy, and technical architecture case study.',
});

export default function CaseStudyPage() {
  return <LocalizedPublicPage page="case-study" />;
}
