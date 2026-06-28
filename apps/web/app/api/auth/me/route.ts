import { getCurrentUserFromRequest, json, publicUser } from '@/lib/server/auth';

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return json({ user: null }, 401);
  return json({ user: publicUser(user) });
}
