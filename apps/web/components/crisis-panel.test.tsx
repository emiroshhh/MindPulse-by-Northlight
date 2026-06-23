// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CrisisPanel } from './crisis-panel';

describe('CrisisPanel', () => {
  it('shows support resources and trusted-adult guidance', () => {
    render(<CrisisPanel locale="en" />);
    expect(screen.getByRole('alert')).toHaveTextContent('trusted adult');
    expect(
      screen.getByRole('link', { name: /Find a Helpline/i }),
    ).toBeInTheDocument();
  });
});
