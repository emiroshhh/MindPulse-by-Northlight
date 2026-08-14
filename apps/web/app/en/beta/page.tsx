import { publicPageMetadata } from '@/lib/marketing-seo';
import { StaticPublicPage } from '@/lib/static-marketing-page';

export const metadata = publicPageMetadata('beta', 'en');

export default function Page() {
  return <StaticPublicPage page="beta" locale="en" />;
}
