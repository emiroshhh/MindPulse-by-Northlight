// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
  vi.stubEnv(
    'NEXT_PUBLIC_FEEDBACK_URL',
    'https://forms.example.com/mindpulse-beta',
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('FeedbackModal', () => {
  it('opens the configured external form and stores only a local marker', async () => {
    const { FeedbackModal } = await import('./feedback-modal');
    render(<FeedbackModal language="en" />);

    fireEvent.click(screen.getByRole('button', { name: 'Share feedback' }));
    const link = screen.getByRole('link', { name: /open feedback form/i });
    expect(link).toHaveAttribute(
      'href',
      'https://forms.example.com/mindpulse-beta',
    );
    expect(link).toHaveAttribute('target', '_blank');

    fireEvent.click(link);
    expect(screen.getByText('Thank you — genuinely.')).toBeInTheDocument();
    const stored = localStorage.getItem('mindpulse-feedback-v1') ?? '';
    expect(stored).toContain('opened_external_feedback');
    expect(stored).not.toContain('private chat');
  });

  it('uses localized Russian feedback copy', async () => {
    const { FeedbackModal } = await import('./feedback-modal');
    render(<FeedbackModal language="ru" />);
    fireEvent.click(screen.getByRole('button', { name: 'Оставить отзыв' }));
    expect(
      screen.getByRole('heading', { name: 'Помоги сделать MindPulse полезнее' }),
    ).toBeInTheDocument();
  });
});
