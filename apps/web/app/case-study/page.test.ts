// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('/case-study', () => {
  it('contains the product, architecture, safety, beta, measurement, and roadmap sections', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');

    expect(source).toContain('Problem and users');
    expect(source).toContain('Product idea');
    expect(source).toContain('Six focused AI tools');
    expect(source).toContain('AI design choices');
    expect(source).toContain('Safety and privacy');
    expect(source).toContain('Technical architecture');
    expect(source).toContain('Beta testing flow');
    expect(source).toContain('What has been built');
    expect(source).toContain('What will be measured next');
    expect(source).toContain('measurement goals, not current impact claims');
    expect(source).toContain('Roadmap');
    expect(source).toContain('by Northlight');
  });
});
