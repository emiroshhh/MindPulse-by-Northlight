import type { Metadata } from 'next';
import { ToolPage } from '@/components/mindpulse/tool-page';
import { toolsByMode } from '@/lib/mindpulse/tools';
import { getCurrentUser, publicUser } from '@/lib/server/auth';

export const metadata: Metadata = { title: 'Habit Coach' };
export const dynamic = 'force-dynamic';

export default async function HabitsPage() {
  const user = await getCurrentUser();
  return (
    <ToolPage tool={toolsByMode.habit} user={user ? publicUser(user) : null} />
  );
}
