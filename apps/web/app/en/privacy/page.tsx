import { publicPageMetadata } from '@/lib/marketing-seo';
import { StaticPublicPage } from '@/lib/static-marketing-page';

export const metadata = publicPageMetadata('privacy', 'en');

export default function Page() {
  return <StaticPublicPage page="privacy" locale="en" />;
}
