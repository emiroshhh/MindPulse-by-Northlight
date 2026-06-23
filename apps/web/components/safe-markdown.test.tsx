// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SafeMarkdown } from './safe-markdown';

describe('SafeMarkdown', () => {
  it('renders emphasis and lists without interpreting HTML', () => {
    const { container } = render(
      <SafeMarkdown>
        {'**Small step**\n- Breathe\n<script>bad()</script>'}
      </SafeMarkdown>,
    );
    expect(screen.getByText('Small step')).toHaveStyle({ fontWeight: 'bold' });
    expect(screen.getByRole('list')).toHaveTextContent('Breathe');
    expect(container.querySelector('script')).not.toBeInTheDocument();
    expect(screen.getByText('<script>bad()</script>')).toBeInTheDocument();
  });
});
