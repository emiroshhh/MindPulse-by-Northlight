import { publicPageMetadata } from '@/lib/marketing-seo';
import { StaticPublicPage } from '@/lib/static-marketing-page';

export const metadata = publicPageMetadata('impact', 'en');

export default function Page() {
  return <StaticPublicPage page="impact" locale="en" />;
}
