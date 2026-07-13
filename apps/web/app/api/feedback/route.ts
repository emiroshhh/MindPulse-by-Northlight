import {
  assessUserInput,
  crisisRepliesFor,
  feedbackSubmissionSchema,
  resourcesForRegion,
  toSafetyLocale,
} from '@mindpulse/shared';
import { clientIp, getAuthDb, json, secureId } from '../../../lib/server/auth';
import { recordEvent } from '../../../lib/server/events';
import {
  checkRateLimitDurable,
  hashedLimiterKey,
} from '../../../lib/server/rate-limit';

const DAY_MS = 24 * 60 * 60 * 1000;
const FEEDBACK_DAILY_LIMIT = 5;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_feedback' }, 400);
  }

  const parsed = feedbackSubmissionSchema.safeParse(body);
  if (!parsed.success) return json({ error: 'invalid_feedback' }, 400);
  const submission = parsed.data;

  // A feedback box is not a chat, but people in distress sometimes use any
  // text field. Crisis content is never stored; the user gets the same
  // localized support routing as chat.
  if (submission.suggestion) {
    const safety = assessUserInput(submission.suggestion);
    if (safety.flagged) {
      const locale = toSafetyLocale(submission.locale);
      const region = request.headers.get('cf-ipcountry') ?? 'UNKNOWN';
      return json({
        crisis: true,
        reply: crisisRepliesFor(locale).join('\n\n'),
        resources: resourcesForRegion(region).map((resource) => ({
          id: resource.id,
          name: resource.name[locale],
          description: resource.description[locale],
          url: resource.url,
          availability: resource.availability[locale],
        })),
      });
    }
  }

  try {
    const db = await getAuthDb();
    const ip = await clientIp();
    const userAgent = request.headers.get('user-agent') ?? 'unknown-agent';
    const limiterKey = await hashedLimiterKey('feedback', `${ip}|${userAgent}`);
    const allowed = await checkRateLimitDurable(
      db,
      limiterKey,
      FEEDBACK_DAILY_LIMIT,
      DAY_MS,
    );
    if (!allowed) return json({ error: 'rate_limited' }, 429);

    await db
      .prepare(
        `INSERT INTO feedback (
          id, flow, helped, confusing, matched_expectation,
          suggestion, locale, device_category, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        secureId('fb'),
        submission.flow,
        toNullableInt(submission.helped),
        toNullableInt(submission.confusing),
        toNullableInt(submission.matchedExpectation),
        submission.suggestion || null,
        submission.locale,
        submission.deviceCategory,
        new Date().toISOString(),
      )
      .run();

    await recordEvent(db, 'feedback_submitted');
    if (submission.helped === true)
      await recordEvent(db, 'feedback_helped_yes');
    if (submission.helped === false)
      await recordEvent(db, 'feedback_helped_no');

    return json({ ok: true });
  } catch (error) {
    console.error('[MindPulse] feedback save failed:', {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
    return json({ error: 'feedback_unavailable' }, 503);
  }
}

function toNullableInt(value: boolean | null) {
  if (value === null) return null;
  return value ? 1 : 0;
}

function methodNotAllowed() {
  return Response.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'POST' } },
  );
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
