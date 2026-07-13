import { describe, expect, it } from 'vitest';
import {
  buildFallbackRecoveryPlan,
  parseRecoveryPlanText,
  recoveryPlanSchema,
  recoveryRequestSchema,
} from '../src/recovery';

const request = recoveryRequestSchema.parse({
  missedContext: 'I missed three days of revision.',
  items: [
    { title: 'History essay', deadline: 'Friday', fixedDeadline: true },
    { title: 'Math problem set', deadline: '', fixedDeadline: false },
    { title: 'Read chapter 4', deadline: 'next week', fixedDeadline: false },
    { title: 'Flashcards', deadline: '', fixedDeadline: false },
  ],
  hoursAvailable: 2,
  energy: 'low',
  language: 'en',
});

describe('recoveryRequestSchema', () => {
  it('rejects empty items, oversized context, and unknown languages', () => {
    expect(
      recoveryRequestSchema.safeParse({ missedContext: 'x', items: [] })
        .success,
    ).toBe(false);
    expect(
      recoveryRequestSchema.safeParse({
        missedContext: 'x'.repeat(501),
        items: [{ title: 'a' }],
      }).success,
    ).toBe(false);
    expect(
      recoveryRequestSchema.safeParse({
        missedContext: 'ok',
        items: [{ title: 'a' }],
        language: 'fr',
      }).success,
    ).toBe(false);
  });

  it('applies defaults', () => {
    const parsed = recoveryRequestSchema.parse({
      missedContext: 'ok',
      items: [{ title: 'a' }],
    });
    expect(parsed.language).toBe('en');
    expect(parsed.energy).toBe('ok');
    expect(parsed.hoursAvailable).toBeNull();
    expect(parsed.items[0]!.fixedDeadline).toBe(false);
  });
});

describe('parseRecoveryPlanText', () => {
  const validPlan = {
    acknowledgement: 'That happens.',
    immediateAction: 'Open the essay file for 10 minutes.',
    urgent: [
      { title: 'History essay', action: 'Draft intro', deadline: 'Friday' },
    ],
    optional: [{ title: 'Flashcards', reason: 'No deadline' }],
    dropped: [],
  };

  it('accepts a bare JSON object', () => {
    const result = parseRecoveryPlanText(JSON.stringify(validPlan));
    expect(result.ok).toBe(true);
  });

  it('accepts JSON wrapped in markdown fences and prose', () => {
    const text = `Here you go:\n\`\`\`json\n${JSON.stringify(validPlan)}\n\`\`\`\nGood luck!`;
    const result = parseRecoveryPlanText(text);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.plan.urgent[0]!.title).toBe('History essay');
  });

  it('rejects prose, invalid JSON, and schema violations', () => {
    expect(parseRecoveryPlanText('I suggest you start small.').ok).toBe(false);
    expect(parseRecoveryPlanText('{not json}').ok).toBe(false);
    expect(
      parseRecoveryPlanText(JSON.stringify({ acknowledgement: 'only this' }))
        .ok,
    ).toBe(false);
    expect(
      parseRecoveryPlanText(
        JSON.stringify({ ...validPlan, immediateAction: '' }),
      ).ok,
    ).toBe(false);
  });
});

describe('buildFallbackRecoveryPlan', () => {
  it('puts fixed deadlines first, caps urgent at 3, drops nothing', () => {
    const plan = buildFallbackRecoveryPlan(request);
    expect(recoveryPlanSchema.safeParse(plan).success).toBe(true);
    expect(plan.urgent[0]!.title).toBe('History essay');
    expect(plan.urgent.length).toBe(3);
    expect(plan.dropped).toEqual([]);
    // Remaining item lands in optional.
    expect(plan.optional.map((item) => item.title)).toContain('Flashcards');
    // The immediate action references the top item, not an invented task.
    expect(plan.immediateAction).toContain('History essay');
  });

  it('localizes fallback copy', () => {
    const ru = buildFallbackRecoveryPlan({ ...request, language: 'ru' });
    expect(ru.acknowledgement).toContain('нормально');
    const kk = buildFallbackRecoveryPlan({ ...request, language: 'kk' });
    expect(kk.acknowledgement).toContain('қалыпты');
  });
});
