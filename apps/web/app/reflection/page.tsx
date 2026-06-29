import type { Metadata } from 'next';
import { ToolPage } from '@/components/mindpulse/tool-page';
import { toolsByMode } from '@/lib/mindpulse/tools';
import { getCurrentUser, publicUser } from '@/lib/server/auth';

export const metadata: Metadata = { title: 'Quick Reflection' };
export const dynamic = 'force-dynamic';

export default async function ReflectionPage() {
  const user = await getCurrentUser();
  return (
    <ToolPage
      tool={toolsByMode.reflection}
      user={user ? publicUser(user) : null}
    />
  );
}
