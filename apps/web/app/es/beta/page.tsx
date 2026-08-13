import { publicPageMetadata } from '@/lib/marketing-seo';
import { StaticPublicPage } from '@/lib/static-marketing-page';

export const metadata = publicPageMetadata('beta', 'es');

export default function Page() {
  return <StaticPublicPage page="beta" locale="es" />;
}
