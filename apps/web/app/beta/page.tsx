import { LocalizedPublicPage } from '@/components/mindpulse/localized-public-page';
import { createPublicPageMetadata } from '@/lib/seo';

export const metadata = createPublicPageMetadata({
  pathname: '/beta',
  title: 'MindPulse Student Beta — Test the AI Study Workspace',
  description:
    'Try the MindPulse student beta on one real task, deadline, habit, goal, or planning problem, then share anonymous feedback about what helped.',
});

export default function BetaPage() {
  return <LocalizedPublicPage page="beta" />;
}
