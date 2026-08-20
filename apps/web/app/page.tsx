import { LandingPage } from '@/components/landing-page';
import { createPublicPageMetadata } from '@/lib/seo';

export const dynamic = 'force-static';

export const metadata = createPublicPageMetadata({
  locale: 'en',
  pathname: '/',
  title: 'MindPulse — AI Study Assistant & Planner for Students',
  description:
    'MindPulse is an AI study assistant for students that turns real tasks, deadlines, and stuck points into clear next steps, realistic plans, and recovery support.',
});

export default function Page() {
  return <LandingPage />;
}
