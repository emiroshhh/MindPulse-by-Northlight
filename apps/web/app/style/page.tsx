'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Moon,
  Sparkles,
  Sun,
} from 'lucide-react';
import type { MoodKey } from '@mindpulse/shared';
import { Badge, Button, Card, Input, Textarea } from '@/components/ui';
import { MoodPicker } from '@/components/mood-picker';

const SWATCHES = [
  ['Canvas', 'bg-canvas'],
  ['Surface', 'bg-surface'],
  ['Sage', 'bg-sage'],
  ['Sage soft', 'bg-sage-soft'],
  ['Mist', 'bg-mist'],
  ['Lavender', 'bg-lavender'],
  ['Warm', 'bg-warm'],
];

export default function StyleReferencePage() {
  const [mood, setMood] = useState<MoodKey | null>('okay');
  const [dark, setDark] = useState(false);
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <main className="ambient min-h-screen px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
            <ArrowLeft size={17} /> MindPulse
          </Link>
          <Button variant="secondary" onClick={toggleTheme}>
            {dark ? <Sun size={17} /> : <Moon size={17} />}
            {dark ? 'Light' : 'Dark'}
          </Button>
        </div>

        <header className="py-12 sm:py-16">
          <Badge>
            <Sparkles className="mr-1.5" size={14} /> Northlight design system
          </Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Calm clarity, built into every surface.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            The reusable tokens and components behind MindPulse. Every state is
            designed for legibility, restraint, and a little breathing room.
          </p>
        </header>

        <section aria-labelledby="colors">
          <h2 id="colors" className="text-2xl font-semibold">
            Color tokens
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {SWATCHES.map(([name, color]) => (
              <Card key={name} className="p-3">
                <div
                  className={`h-20 rounded-2xl border border-ink/5 ${color}`}
                />
                <p className="mt-3 text-sm font-semibold">{name}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-2">
          <Card className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
              Typography
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              A spacious heading
            </h2>
            <h3 className="mt-6 text-xl font-semibold">
              A clear section title
            </h3>
            <p className="mt-3 max-w-prose leading-7 text-muted">
              Body text stays comfortable and direct. It avoids clinical jargon,
              keeps a readable measure, and never asks the user to decode the
              UI.
            </p>
            <p className="mt-4 text-sm text-muted">
              Small supporting detail · 14px
            </p>
          </Card>

          <Card className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
              Actions
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button>Primary action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="quiet">Quiet action</Button>
              <Button variant="danger">Delete</Button>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button disabled>Disabled</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large target</Button>
            </div>
          </Card>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <Card className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
              Mood control
            </p>
            <div className="mt-5">
              <MoodPicker value={mood} onChange={setMood} locale="en" />
            </div>
          </Card>
          <Card className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
              Form controls
            </p>
            <div className="mt-5 space-y-3">
              <Input aria-label="Example title" placeholder="A short title" />
              <Textarea
                aria-label="Example reflection"
                placeholder="Write without an audience…"
                rows={3}
              />
            </div>
          </Card>
        </section>

        <section className="mt-5 grid gap-5 md:grid-cols-3" aria-label="States">
          <Card className="p-5">
            <LoaderCircle className="animate-spin text-sage" size={21} />
            <h3 className="mt-4 font-semibold">Loading gently</h3>
            <div className="mt-3 h-2 w-4/5 animate-pulse rounded-full bg-ink/10" />
            <div className="mt-2 h-2 w-3/5 animate-pulse rounded-full bg-ink/10" />
          </Card>
          <Card className="p-5">
            <CheckCircle2 className="text-sage" size={21} />
            <h3 className="mt-4 font-semibold">Saved privately</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Success copy is brief and never turns care into a score.
            </p>
          </Card>
          <Card className="p-5">
            <AlertCircle className="text-danger" size={21} />
            <h3 className="mt-4 font-semibold">Something paused</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Errors preserve the user’s work and offer a clear next action.
            </p>
          </Card>
        </section>
      </div>
    </main>
  );
}
