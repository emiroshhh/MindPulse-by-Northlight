import { getAuthDb, getCurrentUserFromRequest, json } from '@/lib/server/auth';

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return json({ error: 'unauthorized' }, 401);
  try {
    const db = await getAuthDb();
    const result = await db
      .prepare(
        `SELECT id, role, content, mode, created_at
         FROM chat_messages
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 80`,
      )
      .bind(user.id)
      .all();
    return json({ messages: result.results ?? [] });
  } catch {
    return json({ error: 'history_unavailable' }, 503);
  }
}
