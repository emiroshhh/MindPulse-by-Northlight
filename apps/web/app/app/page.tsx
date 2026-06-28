import type { Metadata } from 'next';
import { DashboardApp } from '@/components/dashboard-app';
import { getCurrentUser, publicUser } from '@/lib/server/auth';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function AppPage() {
  const user = await getCurrentUser();
  return <DashboardApp user={user ? publicUser(user) : null} />;
}
