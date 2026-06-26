import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DashboardApp } from '@/components/dashboard-app';
import { getCurrentUser, publicUser } from '@/lib/server/auth';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function AppPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <DashboardApp user={publicUser(user)} />;
}
