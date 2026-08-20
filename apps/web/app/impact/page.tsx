import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';
import { createPublicPageMetadata } from '@/lib/seo';

export const dynamic = 'force-static';

export const metadata = createPublicPageMetadata({
  locale: 'en',
  pathname: '/impact',
  title: 'MindPulse Impact — Beta Goals & Measurement',
  description:
    'How MindPulse measures beta impact through honest goals, anonymous usage signals, student feedback, and iteration without inflated claims.',
});

export default function ImpactPage() {
  return <LocalizedPublicPage page="impact" />;
}
