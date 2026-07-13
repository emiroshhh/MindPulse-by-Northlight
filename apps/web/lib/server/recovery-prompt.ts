import type { RecoveryRequest } from '@mindpulse/shared';

const LANGUAGE_NAMES: Record<RecoveryRequest['language'], string> = {
  en: 'English',
  ru: 'Russian',
  kk: 'Kazakh',
};

/**
 * System prompt for Recovery Mode. Demands strict JSON because the UI
 * renders typed fields; the route validates with zod and falls back to a
 * deterministic plan if the model cannot comply.
 */
export function buildRecoverySystemPrompt(
  language: RecoveryRequest['language'],
) {
  return [
    'You are MindPulse Recovery Mode, a practical study-recovery assistant for students who fell behind.',
    'You are not a therapist, doctor, or counselor. Never diagnose, never moralize, never guilt-trip.',
    'Principles: acknowledge the miss briefly and without judgment; fixed deadlines come first; reduce scope to what is realistic for the stated time and energy; prefer one small immediate action over a grand plan; never invent tasks the student did not list.',
    `Respond in ${LANGUAGE_NAMES[language]}.`,
    'Return ONLY a single JSON object — no markdown fences, no commentary — with exactly these fields:',
    '{',
    '  "acknowledgement": string (2-3 sentences, warm but plain, max 500 chars),',
    '  "immediateAction": string (ONE concrete action the student can start in the next 10 minutes, max 300 chars),',
    '  "urgent": [{"title": string, "action": string, "deadline": string}] (only items with real deadline pressure, max 3),',
    '  "optional": [{"title": string, "reason": string}] (items that can wait, with a short reason),',
    '  "dropped": [{"title": string, "why": string}] (only if the student listed more than fits their time; explain the postponement honestly)',
    '}',
    "Every title must come from the student's own list. Do not add motivational filler.",
  ].join('\n');
}

export function buildRecoveryInput(request: RecoveryRequest) {
  const items = request.items
    .map((item, index) => {
      const deadline = item.deadline
        ? ` (deadline: ${item.deadline}${item.fixedDeadline ? ', FIXED' : ''})`
        : item.fixedDeadline
          ? ' (FIXED deadline)'
          : '';
      return `${index + 1}. ${item.title}${deadline}`;
    })
    .join('\n');
  const constraints = [
    request.hoursAvailable !== null
      ? `Time available today: about ${request.hoursAvailable} hours.`
      : 'Time available today: not specified.',
    request.energy === 'low'
      ? 'Energy: low — keep the plan very small.'
      : 'Energy: okay.',
  ].join('\n');
  return [
    `What got missed (student's own words):\n${request.missedContext}`,
    `Tasks on the table:\n${items}`,
    constraints,
  ].join('\n\n');
}

/** One-shot repair message appended when the first response fails validation. */
export const RECOVERY_REPAIR_INSTRUCTION =
  'Your previous response was not valid JSON matching the required schema. Return ONLY the JSON object now — no fences, no extra text.';
