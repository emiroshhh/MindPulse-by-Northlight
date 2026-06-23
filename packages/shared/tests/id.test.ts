import { describe, expect, it } from 'vitest';
import { createId } from '../src/id';

describe('createId', () => {
  it('uses randomUUID when available', () => {
    const id = createId('message', {
      randomUUID: () => '11111111-1111-4111-8111-111111111111',
    });
    expect(id).toBe('message-11111111-1111-4111-8111-111111111111');
  });

  it('creates a UUID-shaped ID without randomUUID', () => {
    const id = createId('mood', {
      getRandomValues: (bytes) => {
        bytes.fill(7);
        return bytes;
      },
    });
    expect(id).toMatch(
      /^mood-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('returns a usable ID without Web Crypto', () => {
    expect(createId('journal', null)).toMatch(/^journal-[a-z0-9]+-[a-z0-9]+$/);
  });
});
