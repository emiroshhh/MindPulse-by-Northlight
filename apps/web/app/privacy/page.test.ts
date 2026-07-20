// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PUBLIC_PAGES } from '../../lib/mindpulse/public-page-i18n';

describe('/privacy', () => {
  it('documents storage, AI processing, retention, deletion, and contact boundaries', () => {
    const pageSource = readFileSync(
      new URL('./page.tsx', import.meta.url),
      'utf8',
    );
    const source = JSON.stringify(PUBLIC_PAGES.privacy.en);

    expect(pageSource).toContain('LocalizedPublicPage page="privacy"');
    expect(source).toContain('Guest use');
    expect(source).toContain('Cloudflare D1');
    expect(source).toContain('Usage limits');
    expect(source).toContain('configured AI provider');
    expect(source).toContain('Feedback is optional');
    expect(source).toContain('Retention');
    expect(source).toContain('no fixed automatic deletion period');
    expect(source).toContain('Deletion and privacy requests');
    expect(source).toContain('permanently delete their account');
    expect(source).toContain('never include passwords');
    expect(source).toContain('Aggregate beta measurement');
    expect(source).toContain('Raw IP addresses are not stored');
  });
});
