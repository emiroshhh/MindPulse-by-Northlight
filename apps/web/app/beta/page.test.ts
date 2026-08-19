// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PUBLIC_PAGES } from '../../lib/mindpulse/public-page-i18n';

describe('/beta', () => {
  it('contains the tester journey, boundaries, tools, and feedback access', () => {
    const pageSource = readFileSync(
      new URL('./page.tsx', import.meta.url),
      'utf8',
    );
    const rendererSource = readFileSync(
      new URL(
        '../../components/mindpulse/localized-public-page.tsx',
        import.meta.url,
      ),
      'utf8',
    );
    const source = JSON.stringify(PUBLIC_PAGES.beta.en);

    expect(pageSource).toContain('LocalizedPublicPage page="beta"');
    expect(source).toContain('Test MindPulse on one real study task.');
    expect(source).toContain('Try one tool');
    expect(source).toContain('Use one real task');
    expect(source).toContain('Send feedback');
    expect(source).toContain('Share if useful');
    expect(source).toContain('What it does not do');
    expect(source).toContain('therapist');
    expect(source).toContain('Choose one of six tools');
    expect(rendererSource).toContain('FeedbackModal');
    expect(rendererSource).toContain('by Northlight');
    expect(rendererSource).toContain("beta: '/privacy'");
    expect(rendererSource).toContain('SiteFooter');
  });
});
