import { getCurrentUser, json, requireDb } from '@/lib/server/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return json({ error: 'unauthorized' }, 401);
  try {
    const db = await requireDb();
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
