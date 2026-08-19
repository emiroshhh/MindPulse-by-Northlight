import { acquisitionPageMetadata } from '@/lib/marketing-seo';
import { StaticAcquisitionPage } from '@/lib/static-marketing-page';

export const metadata = acquisitionPageMetadata('catch-up-on-schoolwork', 'ru');

export default function Page() {
  return <StaticAcquisitionPage page="catch-up-on-schoolwork" locale="ru" />;
}
