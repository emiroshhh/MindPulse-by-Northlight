// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './ui';
import { MoodPicker } from './mood-picker';

describe('dark theme contrast contracts', () => {
  it('uses theme-opposite text on the primary brand button', () => {
    render(<Button>Continue</Button>);
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveClass(
      'bg-sage',
      'text-canvas',
    );
  });

  it('keeps mood faces dark on their fixed light pastel backgrounds', () => {
    render(<MoodPicker value={null} onChange={() => undefined} locale="en" />);
    const rough = screen.getByRole('radio', { name: '◡ Rough' });
    expect(rough.querySelector('span')).toHaveClass('text-mood-ink');
  });
});
