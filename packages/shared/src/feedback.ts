import { z } from 'zod';

/**
 * Privacy-conscious product feedback. The submission deliberately excludes
 * user ids, session ids, IPs, emails, chat content, and free-form context
 * beyond one bounded suggestion field. Consent is required to submit but is
 * not stored — a stored row implies it.
 */
export const FEEDBACK_FLOWS = [
  'landing',
  'dashboard',
  'study',
  'planner',
  'motivation',
  'habits',
  'goals',
  'reflection',
  'recovery',
  'beta',
  'other',
] as const;
export type FeedbackFlow = (typeof FEEDBACK_FLOWS)[number];

export const FEEDBACK_DEVICE_CATEGORIES = [
  'mobile',
  'tablet',
  'desktop',
] as const;
export type FeedbackDeviceCategory =
  (typeof FEEDBACK_DEVICE_CATEGORIES)[number];

export const FEEDBACK_SUGGESTION_MAX = 500;

export const feedbackSubmissionSchema = z.object({
  flow: z.enum(FEEDBACK_FLOWS),
  helped: z.boolean().nullable(),
  confusing: z.boolean().nullable(),
  matchedExpectation: z.boolean().nullable(),
  suggestion: z
    .string()
    .trim()
    .max(FEEDBACK_SUGGESTION_MAX)
    .optional()
    .default(''),
  locale: z.enum(['en', 'ru', 'kk']),
  deviceCategory: z.enum(FEEDBACK_DEVICE_CATEGORIES),
  consent: z.literal(true),
});

export type FeedbackSubmission = z.infer<typeof feedbackSubmissionSchema>;
