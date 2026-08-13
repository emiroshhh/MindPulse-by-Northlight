import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';
import { createPublicPageMetadata } from '@/lib/seo';

export const metadata = createPublicPageMetadata({
  pathname: '/privacy',
  title: 'MindPulse Privacy — How Student Data Is Handled',
  description:
    'Plain-language details on what MindPulse stores for guests and accounts, how AI processing works, usage limits, feedback, retention, and deletion.',
});

export default function PrivacyPage() {
  return <LocalizedPublicPage page="privacy" />;
}
