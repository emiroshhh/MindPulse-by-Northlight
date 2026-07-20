import type { Metadata } from 'next';
import { ToolPage } from '@/components/mindpulse/tool-page';
import { toolsByMode } from '@/lib/mindpulse/tools';
import { getCurrentUser, publicUser } from '@/lib/server/auth';

export const metadata: Metadata = { title: 'Motivation Reset' };
export const dynamic = 'force-dynamic';

export default async function MotivationPage() {
  const user = await getCurrentUser();
  return (
    <ToolPage
      tool={toolsByMode.motivation}
      user={user ? publicUser(user) : null}
    />
  );
}
