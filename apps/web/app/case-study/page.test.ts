// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PUBLIC_PAGES } from '../../lib/mindpulse/public-page-i18n';

describe('/case-study', () => {
  it('contains the product, architecture, safety, beta, measurement, and roadmap sections', () => {
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
    const source = JSON.stringify(PUBLIC_PAGES['case-study'].en);

    expect(pageSource).toContain('LocalizedPublicPage page="case-study"');
    expect(source).toContain('Problem and users');
    expect(source).toContain('Product idea');
    expect(source).toContain('Six focused AI tools');
    expect(source).toContain('AI design choices');
    expect(source).toContain('Safety and privacy');
    expect(source).toContain('Technical architecture');
    expect(source).toContain('Beta testing flow');
    expect(source).toContain('What has been built');
    expect(source).toContain('What will be measured next');
    expect(source).toContain('not invented impact');
    expect(source).toContain('Roadmap');
    expect(rendererSource).toContain('by Northlight');
  });
});
