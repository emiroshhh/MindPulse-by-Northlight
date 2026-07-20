import {
  getAuthDb,
  getCurrentUserFromRequest,
  json,
} from '../../../lib/server/auth';

/**
 * Honest account activity aggregates. Everything here is counted from data
 * the user already created — nothing is inferred, predicted, or diagnosed.
 */
export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return json({ error: 'unauthorized' }, 401);
  try {
    const db = await getAuthDb();
    const today = new Date().toISOString().slice(0, 10);

    const activeDays = await db
      .prepare(
        `SELECT COUNT(DISTINCT usage_date) AS n FROM daily_usage WHERE user_id = ?`,
      )
      .bind(user.id)
      .first<{ n: number }>();
    const messagesToday = await db
      .prepare(
        `SELECT COALESCE(SUM(message_count), 0) AS n FROM daily_usage
         WHERE user_id = ? AND usage_date = ?`,
      )
      .bind(user.id, today)
      .first<{ n: number }>();
    const savedResults = await db
      .prepare(
        `SELECT COUNT(*) AS n FROM agent_tasks
         WHERE user_id = ? AND (kind IS NULL OR kind IN ('plan', 'tool_result'))`,
      )
      .bind(user.id)
      .first<{ n: number }>();
    const recovery = await db
      .prepare(
        `SELECT COUNT(*) AS created,
                SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done
         FROM agent_tasks WHERE user_id = ? AND kind = 'recovery'`,
      )
      .bind(user.id)
      .first<{ created: number; done: number | null }>();

    return json({
      activeDays: Number(activeDays?.n ?? 0),
      messagesToday: Number(messagesToday?.n ?? 0),
      savedResults: Number(savedResults?.n ?? 0),
      recoveryPlans: Number(recovery?.created ?? 0),
      recoveryCompleted: Number(recovery?.done ?? 0),
    });
  } catch {
    return json({ error: 'insights_unavailable' }, 503);
  }
}
