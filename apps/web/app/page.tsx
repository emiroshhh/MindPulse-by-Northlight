import { LandingPage } from '@/components/landing-page';
import { createPublicPageMetadata } from '@/lib/seo';

export const metadata = createPublicPageMetadata({
  pathname: '/',
  description:
    'An AI study and self-growth assistant for planning, motivation, habits, goals, and learning.',
});

export default function Page() {
  return <LandingPage />;
}
