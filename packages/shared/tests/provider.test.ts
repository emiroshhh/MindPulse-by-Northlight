import { describe, expect, it } from 'vitest';
import { getAIProvider, providers } from '../src/ai/provider';

describe('getAIProvider', () => {
  it('returns anthropic provider when name is "anthropic"', () => {
    expect(getAIProvider('anthropic')).toBe(providers.anthropic);
  });

  it('returns mock provider when name is "mock"', () => {
    expect(getAIProvider('mock')).toBe(providers.mock);
  });

  it('returns openai provider when name is "openai"', () => {
    expect(getAIProvider('openai')).toBe(providers.openai);
  });

  it('returns openai provider when name is undefined', () => {
    expect(getAIProvider(undefined)).toBe(providers.openai);
  });

  it('returns openai provider when name is an unknown provider', () => {
    expect(getAIProvider('unknown-provider')).toBe(providers.openai);
  });
});
