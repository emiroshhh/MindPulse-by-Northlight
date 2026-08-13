import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';
import { createPublicPageMetadata } from '@/lib/seo';

export const metadata = createPublicPageMetadata({
  locale: 'en',
  pathname: '/why',
  title: 'Why MindPulse Was Built — Student-First AI Support',
  description:
    'Why MindPulse was built: a student-first AI workspace designed to make studying, planning, and restarting after missed days more manageable.',
});

export default function WhyPage() {
  return <LocalizedPublicPage page="why" />;
}
