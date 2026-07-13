import { isBetaEvent, type BetaEvent } from '@mindpulse/shared';

type D1DatabaseLike = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      run: () => Promise<unknown>;
    };
  };
};

/**
 * Increment an aggregate daily counter. Never throws: measurement must never
 * break a product flow, so failures are logged (name only) and swallowed.
 */
export async function recordEvent(
  db: D1DatabaseLike,
  name: BetaEvent,
): Promise<void> {
  if (!isBetaEvent(name)) return;
  try {
    const day = new Date().toISOString().slice(0, 10);
    await db
      .prepare(
        `INSERT INTO events (name, day, count) VALUES (?, ?, 1)
         ON CONFLICT(name, day) DO UPDATE SET count = count + 1`,
      )
      .bind(name, day)
      .run();
  } catch {
    console.error('[MindPulse] event record failed:', { name });
  }
}
