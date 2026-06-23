import { describe, expect, it } from 'vitest';
import { suggestExerciseForMood } from '../src/exercises';

describe('adaptive exercise suggestion', () => {
  it('suggests grounding for a rough check-in', () => {
    expect(suggestExerciseForMood('rough', 'en').exercise.key).toBe(
      'grounding-54321',
    );
  });

  it('returns fully translated reasoning', () => {
    expect(suggestExerciseForMood('low', 'ru').reason).toContain('телу');
  });
});
