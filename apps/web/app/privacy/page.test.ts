// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('/privacy', () => {
  it('documents storage, AI processing, retention, deletion, and contact boundaries', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');

    expect(source).toContain('Guest use');
    expect(source).toContain('Cloudflare D1');
    expect(source).toContain('Usage limits');
    expect(source).toContain('Google Gemini');
    expect(source).toContain('Feedback is optional');
    expect(source).toContain('Beta retention');
    expect(source).toContain('no fixed automatic deletion period');
    expect(source).toContain('Deletion and beta contact');
    expect(source).toContain('Request account-data help');
    expect(source).toContain('never a password, session token');
  });
});
