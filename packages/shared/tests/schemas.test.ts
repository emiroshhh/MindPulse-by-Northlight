import { describe, expect, it } from 'vitest';
import { chatRequestSchema, moodEntrySchema } from '../src/schemas';

describe('shared schemas', () => {
  it('accepts a valid mood check-in', () =>
    expect(
      moodEntrySchema.safeParse({
        mood: 'okay',
        intensity: 3,
        tags: ['school'],
      }).success,
    ).toBe(true));
  it('rejects excessive mood intensity', () =>
    expect(
      moodEntrySchema.safeParse({ mood: 'good', intensity: 8, tags: [] })
        .success,
    ).toBe(false));
  it('limits chat history and message length', () => {
    const result = chatRequestSchema.safeParse({
      message: 'hello',
      sessionId: 'demo-browser',
      locale: 'en',
      history: Array.from({ length: 13 }, () => ({
        role: 'user',
        content: 'hi',
      })),
    });
    expect(result.success).toBe(false);
  });
});
