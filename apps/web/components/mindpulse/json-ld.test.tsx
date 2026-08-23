// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { JsonLd } from './json-ld';

describe('JsonLd', () => {
  it('escapes HTML-sensitive characters to prevent script injection', () => {
    const maliciousData = {
      name: 'Hack',
      description: '</script><script>alert("xss")</script>',
    };

    const { container } = render(<JsonLd data={maliciousData} />);
    const scriptTag = container.querySelector('script');
    
    expect(scriptTag).not.toBeNull();
    const content = scriptTag!.innerHTML;
    
    // Ensure the raw '<' character does not appear in the serialized output
    expect(content).not.toContain('<');
    
    // Ensure it was safely escaped to its unicode representation
    expect(content).toContain('\\u003c/script>\\u003cscript>alert(\\"xss\\")\\u003c/script>');
    
    // Ensure JSON parsing still works properly on the escaped string
    const parsed = JSON.parse(content);
    expect(parsed.description).toBe('</script><script>alert("xss")</script>');
  });
});
