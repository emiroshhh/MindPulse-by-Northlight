'use client';

import { BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UiCopy } from '@/lib/mindpulse/i18n';
import { authHeaders } from '@/lib/mindpulse/client-auth';
import {
  GUEST_CHAT_KEY,
  GUEST_RECOVERY_KEY,
  GUEST_TOOL_RESULTS_KEY,
  readJson,
} from '@/lib/mindpulse/local-store';

type Insights = {
  activeDays: number | null;
  messagesToday: number | null;
  savedResults: number;
  recoveryPlans: number;
};

/**
 * Honest activity numbers only: real counts from the user's own saved data.
 * Empty state instead of invented insights; no trends, no streak pressure,
 * no diagnoses.
 */
export function InsightsCard({
  copy,
  isGuest,
  authReady,
}: {
  copy: UiCopy['insights'];
  isGuest: boolean;
  authReady: boolean;
}) {
  const [insights, setInsights] = useState<Insights | null>(null);

  useEffect(() => {
    if (!authReady) return;
    if (isGuest) {
      const chat = readJson<unknown[]>(GUEST_CHAT_KEY, []);
      const results = readJson<unknown[]>(GUEST_TOOL_RESULTS_KEY, []);
      const recovery = readJson<{ plan?: unknown } | null>(
        GUEST_RECOVERY_KEY,
        null,
      );
      setInsights({
        activeDays: null,
        messagesToday: null,
        savedResults: results.length,
        recoveryPlans: recovery?.plan ? 1 : 0,
      });
      return;
    }
    let active = true;
    void (async () => {
      try {
        const response = await fetch('/api/insights', {
          credentials: 'same-origin',
          cache: 'no-store',
          headers: authHeaders(),
        });
        if (!response.ok || !active) return;
        const body = (await response.json()) as {
          activeDays: number;
          messagesToday: number;
          savedResults: number;
          recoveryPlans: number;
        };
        if (active) setInsights(body);
      } catch {
        // Leave the empty state.
      }
    })();
    return () => {
      active = false;
    };
  }, [authReady, isGuest]);

  const stats: Array<[number, string]> = insights
    ? ([
        ...(insights.activeDays !== null
          ? ([[insights.activeDays, copy.activeDays]] as Array<
              [number, string]
            >)
          : []),
        ...(insights.messagesToday !== null
          ? ([[insights.messagesToday, copy.messagesToday]] as Array<
              [number, string]
            >)
          : []),
        [insights.savedResults, copy.savedResults],
        [insights.recoveryPlans, copy.recoveryPlans],
      ] as Array<[number, string]>)
    : [];
  const hasActivity = stats.some(([value]) => value > 0);

  return (
    <section className="rounded-[2rem] bg-surface p-6 shadow-soft">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <BarChart3 size={18} className="text-sage" /> {copy.title}
      </h2>
      {hasActivity ? (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            {stats.map(([value, label]) => (
              <div key={label} className="rounded-mp bg-canvas/60 p-4">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="mt-1 text-2xl font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted">
            {isGuest ? copy.localNote : copy.accountNote}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm leading-7 text-muted">{copy.empty}</p>
      )}
    </section>
  );
}
