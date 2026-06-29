'use client';

import {
  BookOpen,
  CalendarDays,
  Repeat2,
  Sparkles,
  Target,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { MindPulseTool, ToolIconId } from '@/lib/mindpulse/tools';

const toolIcons: Record<ToolIconId, LucideIcon> = {
  book: BookOpen,
  calendar: CalendarDays,
  repeat: Repeat2,
  sparkles: Sparkles,
  target: Target,
  zap: Zap,
};

export function ToolCard({
  tool,
  openLabel = 'Open tool →',
}: {
  tool: MindPulseTool;
  openLabel?: string;
}) {
  const Icon = toolIcons[tool.iconId];
  return (
    <Link
      href={tool.route}
      className="group rounded-[1.75rem] border border-ink/5 bg-canvas/70 p-5 shadow-soft transition hover:-translate-y-1 hover:bg-sage-soft/70"
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage-soft text-sage transition group-hover:bg-sage group-hover:text-canvas">
        <Icon size={21} />
      </span>
      <h2 className="mt-5 text-lg font-semibold">{tool.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{tool.copy}</p>
      <p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-sage">
        {openLabel}
      </p>
    </Link>
  );
}
