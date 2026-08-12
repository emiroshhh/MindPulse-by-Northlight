import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';
import { createPublicPageMetadata } from '@/lib/seo';

export const metadata = createPublicPageMetadata({
  pathname: '/privacy',
  title: 'Privacy',
  description:
    'Plain-language privacy information for the MindPulse student beta.',
});

export default function PrivacyPage() {
  return <LocalizedPublicPage page="privacy" />;
}
