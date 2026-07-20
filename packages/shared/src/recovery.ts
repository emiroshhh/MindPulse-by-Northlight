import { z } from 'zod';

/**
 * Recovery Mode: a structured workflow for restarting after missed work.
 * The AI is asked for strict JSON matching recoveryPlanSchema; if it fails
 * validation twice, buildFallbackRecoveryPlan produces a deterministic,
 * honest plan from the user's own items — nothing invented.
 */

export const RECOVERY_CONTEXT_MAX = 500;
export const RECOVERY_ITEMS_MAX = 8;

export const recoveryItemInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  deadline: z.string().trim().max(40).optional().default(''),
  fixedDeadline: z.boolean().optional().default(false),
});
export type RecoveryItemInput = z.infer<typeof recoveryItemInputSchema>;

export const recoveryRequestSchema = z.object({
  missedContext: z.string().trim().min(1).max(RECOVERY_CONTEXT_MAX),
  items: z.array(recoveryItemInputSchema).min(1).max(RECOVERY_ITEMS_MAX),
  hoursAvailable: z
    .number()
    .min(0.5)
    .max(24)
    .nullable()
    .optional()
    .default(null),
  energy: z.enum(['low', 'ok']).optional().default('ok'),
  language: z.enum(['en', 'ru', 'kk', 'es']).optional().default('en'),
});
export type RecoveryRequest = z.infer<typeof recoveryRequestSchema>;

export const recoveryPlanSchema = z.object({
  acknowledgement: z.string().trim().min(1).max(500),
  immediateAction: z.string().trim().min(1).max(300),
  urgent: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(160),
        action: z.string().trim().min(1).max(300),
        deadline: z.string().trim().max(60).optional().default(''),
      }),
    )
    .max(RECOVERY_ITEMS_MAX),
  optional: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(160),
        reason: z.string().trim().max(300).optional().default(''),
      }),
    )
    .max(RECOVERY_ITEMS_MAX),
  dropped: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(160),
        why: z.string().trim().max(300).optional().default(''),
      }),
    )
    .max(RECOVERY_ITEMS_MAX),
});
export type RecoveryPlan = z.infer<typeof recoveryPlanSchema>;

/**
 * Extract and validate a plan from raw model text. Tolerates markdown code
 * fences and prose around the JSON object, but the JSON itself must satisfy
 * the schema — no partial acceptance.
 */
export function parseRecoveryPlanText(
  text: string,
): { ok: true; plan: RecoveryPlan } | { ok: false } {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return { ok: false };
  try {
    const parsed: unknown = JSON.parse(text.slice(start, end + 1));
    const result = recoveryPlanSchema.safeParse(parsed);
    return result.success ? { ok: true, plan: result.data } : { ok: false };
  } catch {
    return { ok: false };
  }
}

type FallbackCopy = {
  acknowledgement: string;
  immediateAction: (title: string) => string;
  urgentAction: (title: string) => string;
  optionalReason: string;
};

// kk strings NEED NATIVE REVIEW; the fallback plan is productivity content
// (not safety-critical), so single-language display is acceptable here.
const FALLBACK_COPY: Record<'en' | 'ru' | 'kk' | 'es', FallbackCopy> = {
  en: {
    acknowledgement:
      'Falling behind happens to everyone. This is a smaller restart built only from what you listed — fixed deadlines first, everything else reduced.',
    immediateAction: (title) =>
      `Set a timer for 10 minutes and start the smallest piece of “${title}”. Stopping after 10 minutes is allowed.`,
    urgentAction: (title) => `Do the next small concrete step of “${title}”.`,
    optionalReason: 'No fixed deadline — schedule it after the urgent items.',
  },
  ru: {
    acknowledgement:
      'Отставать — нормально, это случается со всеми. Это уменьшенный перезапуск только из того, что ты перечислил(а): сначала жёсткие дедлайны, остальное — меньше.',
    immediateAction: (title) =>
      `Поставь таймер на 10 минут и начни самый маленький кусочек «${title}». Остановиться через 10 минут — можно.`,
    urgentAction: (title) =>
      `Сделай следующий небольшой конкретный шаг по «${title}».`,
    optionalReason: 'Нет жёсткого дедлайна — запланируй после срочных задач.',
  },
  kk: {
    acknowledgement:
      'Артта қалу — қалыпты жағдай, бәрінде болады. Бұл тек өзің жазған тізімнен құрылған кішірек қайта бастау: алдымен қатаң дедлайндар, қалғаны азайтылған.',
    immediateAction: (title) =>
      `Таймерді 10 минутқа қой да, «${title}» ішіндегі ең кіші бөлікті баста. 10 минуттан кейін тоқтауға болады.`,
    urgentAction: (title) =>
      `«${title}» бойынша келесі кішкентай нақты қадамды жаса.`,
    optionalReason: 'Қатаң дедлайн жоқ — шұғыл істерден кейін жоспарла.',
  },
  es: {
    acknowledgement:
      'A cualquiera le puede pasar quedarse atrás. Este reinicio usa solo lo que anotaste: primero las fechas fijas y con una carga menor para lo demás.',
    immediateAction: (title) =>
      `Programa un temporizador de 10 minutos y empieza la parte más pequeña de “${title}”. Puedes parar después de 10 minutos.`,
    urgentAction: (title) =>
      `Haz el siguiente paso pequeño y concreto de “${title}”.`,
    optionalReason:
      'No tiene una fecha límite fija: prográmalo después de las tareas urgentes.',
  },
};

/**
 * Deterministic plan from the user's own items. Fixed-deadline items become
 * urgent (max 3 to keep scope realistic); the rest become optional. Nothing
 * is dropped automatically — the fallback never decides to abandon work the
 * user did not mark as optional.
 */
export function buildFallbackRecoveryPlan(
  request: RecoveryRequest,
): RecoveryPlan {
  const copy = FALLBACK_COPY[request.language];
  const fixed = request.items.filter((item) => item.fixedDeadline);
  const flexible = request.items.filter((item) => !item.fixedDeadline);
  // Keep scope honest: at most 3 urgent items, fixed deadlines first.
  const urgentSource = [...fixed, ...flexible].slice(0, 3);
  const urgentTitles = new Set(urgentSource.map((item) => item.title));
  const optionalSource = request.items.filter(
    (item) => !urgentTitles.has(item.title),
  );

  const firstTitle = urgentSource[0]?.title ?? request.items[0]!.title;
  return {
    acknowledgement: copy.acknowledgement,
    immediateAction: copy.immediateAction(firstTitle),
    urgent: urgentSource.map((item) => ({
      title: item.title,
      action: copy.urgentAction(item.title),
      deadline: item.deadline ?? '',
    })),
    optional: optionalSource.map((item) => ({
      title: item.title,
      reason: copy.optionalReason,
    })),
    dropped: [],
  };
}
