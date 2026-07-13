import type { Metadata } from 'next';
import { RecoveryFlow } from '@/components/recovery/recovery-flow';
import { getCurrentUser, publicUser } from '@/lib/server/auth';

export const metadata: Metadata = { title: 'Recovery Mode' };
export const dynamic = 'force-dynamic';

export default async function RecoveryPage() {
  const user = await getCurrentUser();
  return <RecoveryFlow user={user ? publicUser(user) : null} />;
}
