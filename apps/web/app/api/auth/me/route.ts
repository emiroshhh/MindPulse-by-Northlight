import { getCurrentUser, json, publicUser } from '@/lib/server/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return json({ user: null }, 401);
  return json({ user: publicUser(user) });
}
