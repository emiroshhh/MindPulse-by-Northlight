import { acquisitionPageMetadata } from '@/lib/marketing-seo';
import { StaticAcquisitionPage } from '@/lib/static-marketing-page';

export const metadata = acquisitionPageMetadata('ai-study-planner', 'kk');

export default function Page() {
  return <StaticAcquisitionPage page="ai-study-planner" locale="kk" />;
}
