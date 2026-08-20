import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';
import { createPublicPageMetadata } from '@/lib/seo';

export const dynamic = 'force-static';

export const metadata = createPublicPageMetadata({
  locale: 'en',
  pathname: '/case-study',
  title: 'MindPulse Case Study — Safety, Privacy & Architecture',
  description:
    'A transparent case study of how MindPulse approaches AI student support, product design, safety, privacy, and its technical architecture.',
});

export default function CaseStudyPage() {
  return <LocalizedPublicPage page="case-study" />;
}
