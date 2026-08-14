import { publicPageMetadata } from '@/lib/marketing-seo';
import { StaticPublicPage } from '@/lib/static-marketing-page';

export const metadata = publicPageMetadata('why', 'ru');

export default function Page() {
  return <StaticPublicPage page="why" locale="ru" />;
}
