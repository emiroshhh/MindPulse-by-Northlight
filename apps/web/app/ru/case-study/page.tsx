import { publicPageMetadata } from '@/lib/marketing-seo';
import { StaticPublicPage } from '@/lib/static-marketing-page';

export const metadata = publicPageMetadata('case-study', 'ru');

export default function Page() {
  return <StaticPublicPage page="case-study" locale="ru" />;
}
