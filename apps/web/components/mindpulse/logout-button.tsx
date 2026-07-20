'use client';

import { LogOut } from 'lucide-react';
import React from 'react';
import {
  authHeaders,
  clearClientSessionToken,
} from '../../lib/mindpulse/client-auth';

export function LogoutButton({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  async function logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: authHeaders(),
      });
    } finally {
      clearClientSessionToken();
      window.location.href = '/';
    }
  }

  return (
    <button type="button" onClick={() => void logout()} className={className}>
      <LogOut size={15} /> {label}
    </button>
  );
}
