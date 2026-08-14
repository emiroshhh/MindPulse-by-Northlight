import { publicPageMetadata } from '@/lib/marketing-seo';
import { StaticPublicPage } from '@/lib/static-marketing-page';

export const metadata = publicPageMetadata('beta', 'ru');

export default function Page() {
  return <StaticPublicPage page="beta" locale="ru" />;
}
