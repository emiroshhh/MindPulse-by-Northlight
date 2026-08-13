import { landingMetadata } from '@/lib/marketing-seo';
import { StaticLandingPage } from '@/lib/static-marketing-page';

export const metadata = landingMetadata('kk');

export default function Page() {
  return <StaticLandingPage locale="kk" />;
}
