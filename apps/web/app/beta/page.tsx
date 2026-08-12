import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';
import { createPublicPageMetadata } from '@/lib/seo';

export const metadata = createPublicPageMetadata({
  pathname: '/beta',
  title: 'Beta testing',
  description: 'A practical guide to testing the free MindPulse student beta.',
});

export default function BetaPage() {
  return <LocalizedPublicPage page="beta" />;
}
