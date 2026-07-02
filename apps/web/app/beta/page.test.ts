// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('/beta', () => {
  it('contains the tester journey, boundaries, tools, and feedback access', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');

    expect(source).toContain('Test MindPulse on one real task.');
    expect(source).toContain('Try one tool');
    expect(source).toContain('Use one real task');
    expect(source).toContain('Send feedback');
    expect(source).toContain('Share if useful');
    expect(source).toContain('What it does not do');
    expect(source).toContain('not therapy, medical care');
    expect(source).toContain('Choose one of six tools');
    expect(source).toContain('label="Send beta feedback"');
    expect(source).toContain('by Northlight');
    expect(source).toContain('href="/privacy"');
  });
});
