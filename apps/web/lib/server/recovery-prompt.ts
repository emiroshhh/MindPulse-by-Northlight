import type { RecoveryRequest } from '@mindpulse/shared';

const LANGUAGE_NAMES: Record<RecoveryRequest['language'], string> = {
  en: 'English',
  ru: 'Russian',
  kk: 'Kazakh',
  es: 'Spanish',
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
  const spanish = request.language === 'es';
  const items = request.items
    .map((item, index) => {
      const deadline = item.deadline
        ? ` (${spanish ? 'fecha límite' : 'deadline'}: ${item.deadline}${item.fixedDeadline ? (spanish ? ', FIJA' : ', FIXED') : ''})`
        : item.fixedDeadline
          ? spanish
            ? ' (fecha límite FIJA)'
            : ' (FIXED deadline)'
          : '';
      return `${index + 1}. ${item.title}${deadline}`;
    })
    .join('\n');
  const constraints = [
    request.hoursAvailable !== null
      ? spanish
        ? `Tiempo disponible hoy: unas ${request.hoursAvailable} horas.`
        : `Time available today: about ${request.hoursAvailable} hours.`
      : spanish
        ? 'Tiempo disponible hoy: no especificado.'
        : 'Time available today: not specified.',
    request.energy === 'low'
      ? spanish
        ? 'Energía: baja; el plan debe ser muy pequeño.'
        : 'Energy: low — keep the plan very small.'
      : spanish
        ? 'Energía: bien.'
        : 'Energy: okay.',
  ].join('\n');
  return [
    spanish
      ? `Lo que quedó pendiente (palabras del estudiante):\n${request.missedContext}`
      : `What got missed (student's own words):\n${request.missedContext}`,
    spanish ? `Tareas pendientes:\n${items}` : `Tasks on the table:\n${items}`,
    constraints,
  ].join('\n\n');
}

/** One-shot repair message appended when the first response fails validation. */
export function recoveryRepairInstruction(
  language: RecoveryRequest['language'],
) {
  if (language === 'es') {
    return 'La respuesta anterior no era un JSON válido con el esquema requerido. Devuelve SOLO el objeto JSON, sin bloques de código ni texto adicional.';
  }
  return 'Your previous response was not valid JSON matching the required schema. Return ONLY the JSON object now — no fences, no extra text.';
}
