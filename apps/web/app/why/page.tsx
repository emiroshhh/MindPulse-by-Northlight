import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';
import { createPublicPageMetadata } from '@/lib/seo';

export const metadata = createPublicPageMetadata({
  pathname: '/why',
  title: 'Why I built this',
  description: 'The student problem and product principles behind MindPulse.',
});

export default function WhyPage() {
  return <LocalizedPublicPage page="why" />;
}
