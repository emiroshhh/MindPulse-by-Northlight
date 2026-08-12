import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';
import { createPublicPageMetadata } from '@/lib/seo';

export const metadata = createPublicPageMetadata({
  pathname: '/impact',
  title: 'Impact',
  description: 'Honest beta goals and impact measurement for MindPulse.',
});

export default function ImpactPage() {
  return <LocalizedPublicPage page="impact" />;
}
