import { describe, expect, it } from 'vitest';
import { assessModelOutput, assessUserInput } from '../src/safety';

describe('safety engine', () => {
  it.each([
    'I want to kill myself',
    "I don't want to be alive",
    'Я хочу умереть',
    'Я хочу покончить с собой',
    'someone is going to hurt me',
  ])('flags crisis language: %s', (input) => {
    const result = assessUserInput(input);
    expect(result.flagged).toBe(true);
    expect(result.level).toBe('crisis');
  });
  it('marks abuse disclosure as a concern', () => {
    const result = assessUserInput('my parent hits me');
    expect(result.level).toBe('concern');
    expect(result.categories).toContain('abuse');
  });
  it.each(['I need to kill time', 'That test killed me', 'I had a rough day'])(
    'does not flag common non-crisis language: %s',
    (input) => expect(assessUserInput(input).flagged).toBe(false),
  );
  it('blocks diagnostic model claims', () => {
    const result = assessModelOutput('You definitely have depression.');
    expect(result.level).toBe('blocked_output');
    expect(result.categories).toContain('medical_claim');
  });
  it('allows warm non-clinical model language', () =>
    expect(
      assessModelOutput('That sounds hard. Would taking one small pause help?')
        .flagged,
    ).toBe(false));
});
