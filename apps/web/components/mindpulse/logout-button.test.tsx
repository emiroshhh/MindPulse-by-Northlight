// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const clientAuthMocks = vi.hoisted(() => ({
  authHeaders: vi.fn(() => ({ Authorization: 'Bearer session-token' })),
  clearClientSessionToken: vi.fn(),
}));

vi.mock('../../lib/mindpulse/client-auth', () => clientAuthMocks);

import { LogoutButton } from './logout-button';

afterEach(() => {
  vi.restoreAllMocks();
  clientAuthMocks.authHeaders.mockClear();
  clientAuthMocks.clearClientSessionToken.mockClear();
});

describe('LogoutButton', () => {
  it('uses POST /api/auth/logout and clears the local fallback token', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal('fetch', fetchMock);

    render(<LogoutButton label="Log out" className="test-class" />);
    fireEvent.click(screen.getByRole('button', { name: /log out/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/logout',
        expect.objectContaining({
          method: 'POST',
          credentials: 'same-origin',
          headers: { Authorization: 'Bearer session-token' },
        }),
      );
    });
    expect(clientAuthMocks.clearClientSessionToken).toHaveBeenCalled();
  });
});
