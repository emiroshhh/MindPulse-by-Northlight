import type { Metadata } from 'next';
import { ToolPage } from '@/components/mindpulse/tool-page';
import { toolsByMode } from '@/lib/mindpulse/tools';
import { getCurrentUser, publicUser } from '@/lib/server/auth';

export const metadata: Metadata = { title: 'Daily Planner' };
export const dynamic = 'force-dynamic';

export default async function PlannerPage() {
  const user = await getCurrentUser();
  return (
    <ToolPage
      tool={toolsByMode.planner}
      user={user ? publicUser(user) : null}
    />
  );
}
