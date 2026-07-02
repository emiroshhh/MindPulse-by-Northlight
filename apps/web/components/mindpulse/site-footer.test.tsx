// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteFooter } from './site-footer';

describe('SiteFooter', () => {
  it('renders the public project links without fake destinations', () => {
    render(<SiteFooter language="en" />);

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/app');
    expect(screen.getByRole('link', { name: 'Why I built this' })).toHaveAttribute('href', '/why');
    expect(screen.getByRole('link', { name: 'Beta testing' })).toHaveAttribute('href', '/beta');
    expect(screen.getByRole('link', { name: 'Case study' })).toHaveAttribute('href', '/case-study');
    expect(screen.getByRole('link', { name: 'Impact' })).toHaveAttribute('href', '/impact');
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
  });
});
