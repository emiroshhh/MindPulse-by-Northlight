export type DeadlineStatus = 'todo' | 'done';
export type StudyBlockStatus = 'planned' | 'done' | 'missed' | 'moved';
export type EventLogType = 'blockDone' | 'blockMissed' | 'opened' | 'panic';

export type Weekday = '0' | '1' | '2' | '3' | '4' | '5' | '6';

export type TimeRange = {
  start: string;
  end: string;
};

export type NoGoTime = TimeRange & {
  weekday?: Weekday | undefined;
  date?: string | undefined;
  label?: string | undefined;
};

export type Deadline = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  estMinutes: number;
  status: DeadlineStatus;
  createdAt: string;
};

export type StudyBlock = {
  id: string;
  deadlineId?: string | undefined;
  title: string;
  subject: string;
  date: string;
  durationMin: number;
  status: StudyBlockStatus;
  movedFrom?: string | undefined;
  createdAt: string;
};

export type EventLog = {
  id: string;
  type: EventLogType;
  ref?: string | undefined;
  ts: string;
};

export type Settings = {
  studyWindows: Record<Weekday, TimeRange[]>;
  noGoTimes: NoGoTime[];
  nightCutoffHour: number;
};

export type AppMeta = {
  lastOpenedAt?: string | undefined;
  lastAgentRunAt?: string | undefined;
};

export type AgentReport = {
  date: string;
  lines: string[];
  oneThingBlockId?: string | undefined;
  practiceQuestions?: string[] | undefined;
};

export type AgentState = {
  deadlines: Deadline[];
  studyBlocks: StudyBlock[];
  eventLogs: EventLog[];
  settings: Settings;
  meta: AppMeta;
  latestReport?: AgentReport | undefined;
};

export type AgentRunResult = {
  state: AgentState;
  report?: AgentReport;
  movedBlocks: StudyBlock[];
  ran: boolean;
};

const STORAGE_KEY = 'mindpulse-agent-state-v1';
const DAY_MS = 86_400_000;

export const DEFAULT_SETTINGS: Settings = {
  studyWindows: {
    '0': [{ start: '10:00', end: '12:00' }],
    '1': [{ start: '16:00', end: '19:00' }],
    '2': [{ start: '16:00', end: '19:00' }],
    '3': [{ start: '16:00', end: '19:00' }],
    '4': [{ start: '16:00', end: '19:00' }],
    '5': [{ start: '16:00', end: '18:30' }],
    '6': [{ start: '10:00', end: '12:00' }],
  },
  noGoTimes: [],
  nightCutoffHour: 21,
};

export const EMPTY_AGENT_STATE: AgentState = {
  deadlines: [],
  studyBlocks: [],
  eventLogs: [],
  settings: DEFAULT_SETTINGS,
  meta: {},
};

export function loadAgentState(): AgentState {
  if (typeof window === 'undefined') return EMPTY_AGENT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return parseAgentState(raw ? JSON.parse(raw) : {});
  } catch {
    return EMPTY_AGENT_STATE;
  }
}

export function saveAgentState(state: AgentState) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(parseAgentState(state)),
  );
}

export function clearAgentState() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getAgentStorageKey() {
  return STORAGE_KEY;
}

export function createDeadline(input: {
  title: string;
  subject: string;
  dueDate: string;
  estMinutes: number;
  now?: Date;
}): Deadline {
  const now = input.now ?? new Date();
  return {
    id: uid('deadline'),
    title: cleanText(input.title, 'Study task'),
    subject: cleanText(input.subject, 'General'),
    dueDate: safeIso(input.dueDate, addDays(now, 2).toISOString()),
    estMinutes: clampMinutes(input.estMinutes, 20, 240),
    status: 'todo',
    createdAt: now.toISOString(),
  };
}

export function parseDeadlineLines(text: string, now = new Date()): Deadline[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((line, index) => {
      const parts = line
        .split(/[,|;]/)
        .map((part) => part.trim())
        .filter(Boolean);
      const title = parts[0] ?? `Study task ${index + 1}`;
      const subject = parts[1] ?? inferSubject(title);
      const due = parseDueInput(parts[2] ?? '', now);
      const minutes = Number.parseInt(parts[3] ?? '', 10);
      return createDeadline({
        title,
        subject,
        dueDate: due.toISOString(),
        estMinutes: Number.isFinite(minutes) ? minutes : 45,
        now,
      });
    });
}

export function settingsWithWeekdayWindow(
  settings: Settings,
  weekdayWindow: string,
): Settings {
  const parsed = parseWindow(weekdayWindow) ?? { start: '16:00', end: '19:00' };
  return {
    ...settings,
    studyWindows: {
      ...settings.studyWindows,
      '1': [parsed],
      '2': [parsed],
      '3': [parsed],
      '4': [parsed],
      '5': [parsed],
    },
  };
}

export function generateInitialPlan(state: AgentState, now = new Date()) {
  let blocks = [...state.studyBlocks];
  const activeDeadlines = state.deadlines
    .filter((deadline) => deadline.status === 'todo')
    .sort((a, b) => dateMs(a.dueDate) - dateMs(b.dueDate));

  for (const deadline of activeDeadlines) {
    if (blocks.some((block) => block.deadlineId === deadline.id)) continue;
    const duration = clampMinutes(deadline.estMinutes, 20, 120);
    const slot =
      findNextAvailableSlot({
        settings: state.settings,
        existingBlocks: blocks,
        durationMin: duration,
        from: now,
        latestEnd: new Date(deadline.dueDate),
      }) ??
      findNextAvailableSlot({
        settings: state.settings,
        existingBlocks: blocks,
        durationMin: duration,
        from: now,
      });
    if (!slot) continue;
    blocks = [
      ...blocks,
      {
        id: uid('block'),
        deadlineId: deadline.id,
        title: `Work on ${deadline.title}`,
        subject: deadline.subject,
        date: slot.toISOString(),
        durationMin: duration,
        status: 'planned',
        createdAt: now.toISOString(),
      },
    ];
  }

  const oneThingBlockId = chooseOneThing(blocks, state.deadlines, now)?.id;
  return {
    ...state,
    studyBlocks: blocks,
    latestReport: oneThingBlockId
      ? {
          date: dateKey(now),
          oneThingBlockId,
          lines: [
            'I made a first calm plan. Start with one thing, not everything.',
          ],
        }
      : state.latestReport,
  };
}

export function runAgentOnOpen(
  state: AgentState,
  now = new Date(),
): AgentRunResult {
  const normalized = parseAgentState(state);
  const previousOpenedAt = normalized.meta.lastOpenedAt;
  const missed = detectMissedBlocks(normalized.studyBlocks, now);
  const dayChanged = previousOpenedAt
    ? dateKey(new Date(previousOpenedAt)) !== dateKey(now)
    : false;
  const ranToday = normalized.meta.lastAgentRunAt
    ? dateKey(new Date(normalized.meta.lastAgentRunAt)) === dateKey(now)
    : false;
  const hasPlan =
    normalized.deadlines.length > 0 || normalized.studyBlocks.length > 0;
  const shouldRun = hasPlan && (missed.length > 0 || (dayChanged && !ranToday));

  if (!shouldRun) {
    return {
      state: {
        ...normalized,
        eventLogs: [
          ...normalized.eventLogs,
          { id: uid('event'), type: 'opened' as const, ts: now.toISOString() },
        ].slice(-200),
        meta: { ...normalized.meta, lastOpenedAt: now.toISOString() },
      },
      movedBlocks: [],
      ran: false,
    };
  }

  let blocks = [...normalized.studyBlocks];
  const movedBlocks: StudyBlock[] = [];
  const events: EventLog[] = [];

  for (const block of missed) {
    const slot = findNextAvailableSlot({
      settings: normalized.settings,
      existingBlocks: blocks.filter((item) => item.id !== block.id),
      durationMin: block.durationMin,
      from: now,
    });
    if (!slot) continue;
    const moved: StudyBlock = {
      ...block,
      date: slot.toISOString(),
      status: 'moved',
      movedFrom: block.movedFrom ?? block.date,
    };
    blocks = blocks.map((item) => (item.id === block.id ? moved : item));
    movedBlocks.push(moved);
    events.push({
      id: uid('event'),
      type: 'blockMissed' as const,
      ref: block.id,
      ts: now.toISOString(),
    });
  }

  const oneThing = chooseOneThing(blocks, normalized.deadlines, now);
  const report = composeFallbackReport({
    movedBlocks,
    oneThing,
    now,
    hadDayBoundary: dayChanged,
  });

  return {
    state: {
      ...normalized,
      studyBlocks: blocks,
      latestReport: report,
      eventLogs: [
        ...normalized.eventLogs,
        ...events,
        { id: uid('event'), type: 'opened' as const, ts: now.toISOString() },
      ].slice(-200),
      meta: {
        ...normalized.meta,
        lastOpenedAt: now.toISOString(),
        lastAgentRunAt: now.toISOString(),
      },
    },
    report,
    movedBlocks,
    ran: true,
  };
}

export function markBlockDone(
  state: AgentState,
  blockId: string,
  now = new Date(),
): AgentState {
  const blocks = state.studyBlocks.map((block) =>
    block.id === blockId ? { ...block, status: 'done' as const } : block,
  );
  return {
    ...state,
    studyBlocks: blocks,
    eventLogs: [
      ...state.eventLogs,
      {
        id: uid('event'),
        type: 'blockDone' as const,
        ref: blockId,
        ts: now.toISOString(),
      },
    ].slice(-200),
  };
}

export function chooseOneThing(
  blocks: StudyBlock[],
  deadlines: Deadline[],
  now = new Date(),
) {
  const deadlineById = new Map(
    deadlines.map((deadline) => [deadline.id, deadline]),
  );
  return blocks
    .filter((block) => block.status !== 'done' && block.status !== 'missed')
    .filter(
      (block) =>
        dateMs(block.date) + block.durationMin * 60_000 >= now.getTime(),
    )
    .sort((a, b) => {
      const aDeadline = a.deadlineId
        ? deadlineById.get(a.deadlineId)
        : undefined;
      const bDeadline = b.deadlineId
        ? deadlineById.get(b.deadlineId)
        : undefined;
      const aDue = aDeadline
        ? dateMs(aDeadline.dueDate)
        : Number.MAX_SAFE_INTEGER;
      const bDue = bDeadline
        ? dateMs(bDeadline.dueDate)
        : Number.MAX_SAFE_INTEGER;
      return aDue - bDue || dateMs(a.date) - dateMs(b.date);
    })[0];
}

export function blocksForDay(blocks: StudyBlock[], day = new Date()) {
  const key = dateKey(day);
  return blocks
    .filter((block) => dateKey(new Date(block.date)) === key)
    .sort((a, b) => dateMs(a.date) - dateMs(b.date));
}

export function formatBlockTime(block: StudyBlock) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(block.date));
}

export function formatDueDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

export function isNightState(settings: Settings, now = new Date()) {
  return now.getHours() >= settings.nightCutoffHour;
}

export function summarizeToday(state: AgentState, now = new Date()) {
  const today = blocksForDay(state.studyBlocks, now);
  return {
    done: today.filter((block) => block.status === 'done').length,
    moved: today.filter((block) => block.status === 'moved').length,
    remaining: today.filter((block) => block.status !== 'done').length,
  };
}

export function parseJsonArrayFromText(text: string): string[] | null {
  const cleaned = text
    .replace(/^```json/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim();
  try {
    const value = JSON.parse(cleaned) as unknown;
    if (!value || typeof value !== 'object') return null;
    const lines = (value as Record<string, unknown>).lines;
    if (!Array.isArray(lines)) return null;
    const safe = lines
      .filter((line): line is string => typeof line === 'string')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 3);
    return safe.length ? safe : null;
  } catch {
    return null;
  }
}

function parseAgentState(value: unknown): AgentState {
  const record =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};
  return {
    deadlines: parseDeadlines(record.deadlines),
    studyBlocks: parseBlocks(record.studyBlocks),
    eventLogs: parseEvents(record.eventLogs),
    settings: parseSettings(record.settings),
    meta: parseMeta(record.meta),
    latestReport: parseReport(record.latestReport),
  };
}

function parseDeadlines(value: unknown): Deadline[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const title = typeof record.title === 'string' ? record.title.trim() : '';
    if (!title) return [];
    return [
      {
        id: typeof record.id === 'string' ? record.id : uid('deadline'),
        title,
        subject:
          typeof record.subject === 'string' && record.subject.trim()
            ? record.subject.trim()
            : 'General',
        dueDate: safeIso(record.dueDate, addDays(new Date(), 2).toISOString()),
        estMinutes: clampMinutes(Number(record.estMinutes), 10, 360),
        status: record.status === 'done' ? 'done' : 'todo',
        createdAt: safeIso(record.createdAt, new Date().toISOString()),
      },
    ];
  });
}

function parseBlocks(value: unknown): StudyBlock[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const title = typeof record.title === 'string' ? record.title.trim() : '';
    if (!title) return [];
    const status: StudyBlockStatus =
      record.status === 'done' ||
      record.status === 'missed' ||
      record.status === 'moved'
        ? record.status
        : 'planned';
    return [
      {
        id: typeof record.id === 'string' ? record.id : uid('block'),
        deadlineId:
          typeof record.deadlineId === 'string' ? record.deadlineId : undefined,
        title,
        subject:
          typeof record.subject === 'string' && record.subject.trim()
            ? record.subject.trim()
            : 'General',
        date: safeIso(record.date, addDays(new Date(), 1).toISOString()),
        durationMin: clampMinutes(Number(record.durationMin), 10, 240),
        status,
        movedFrom:
          typeof record.movedFrom === 'string' ? record.movedFrom : undefined,
        createdAt: safeIso(record.createdAt, new Date().toISOString()),
      },
    ];
  });
}

function parseEvents(value: unknown): EventLog[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const record = item as Record<string, unknown>;
      const type = record.type;
      if (
        type !== 'blockDone' &&
        type !== 'blockMissed' &&
        type !== 'opened' &&
        type !== 'panic'
      )
        return [];
      return [
        {
          id: typeof record.id === 'string' ? record.id : uid('event'),
          type: type as EventLogType,
          ref: typeof record.ref === 'string' ? record.ref : undefined,
          ts: safeIso(record.ts, new Date().toISOString()),
        },
      ];
    })
    .slice(-200);
}

function parseSettings(value: unknown): Settings {
  if (!value || typeof value !== 'object') return DEFAULT_SETTINGS;
  const record = value as Record<string, unknown>;
  return {
    studyWindows: parseStudyWindows(record.studyWindows),
    noGoTimes: parseNoGoTimes(record.noGoTimes),
    nightCutoffHour: clampHour(Number(record.nightCutoffHour), 21),
  };
}

function parseStudyWindows(value: unknown): Record<Weekday, TimeRange[]> {
  const fallback = DEFAULT_SETTINGS.studyWindows;
  if (!value || typeof value !== 'object') return fallback;
  const record = value as Record<string, unknown>;
  return weekdays().reduce(
    (acc, weekday) => {
      const ranges = Array.isArray(record[weekday])
        ? (record[weekday] as unknown[]).flatMap((item) => {
            if (!item || typeof item !== 'object') return [];
            const range = item as Record<string, unknown>;
            const parsed =
              typeof range.start === 'string' && typeof range.end === 'string'
                ? parseWindow(`${range.start}-${range.end}`)
                : null;
            return parsed ? [parsed] : [];
          })
        : [];
      acc[weekday] = ranges.length ? ranges : fallback[weekday];
      return acc;
    },
    {} as Record<Weekday, TimeRange[]>,
  );
}

function parseNoGoTimes(value: unknown): NoGoTime[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const parsed =
      typeof record.start === 'string' && typeof record.end === 'string'
        ? parseWindow(`${record.start}-${record.end}`)
        : null;
    if (!parsed) return [];
    return [
      {
        ...parsed,
        weekday: isWeekday(record.weekday) ? record.weekday : undefined,
        date: typeof record.date === 'string' ? record.date : undefined,
        label: typeof record.label === 'string' ? record.label : undefined,
      },
    ];
  });
}

function parseMeta(value: unknown): AppMeta {
  if (!value || typeof value !== 'object') return {};
  const record = value as Record<string, unknown>;
  return {
    lastOpenedAt:
      typeof record.lastOpenedAt === 'string'
        ? safeIso(record.lastOpenedAt, '')
        : undefined,
    lastAgentRunAt:
      typeof record.lastAgentRunAt === 'string'
        ? safeIso(record.lastAgentRunAt, '')
        : undefined,
  };
}

function parseReport(value: unknown): AgentReport | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  const lines = Array.isArray(record.lines)
    ? record.lines.filter((line): line is string => typeof line === 'string')
    : [];
  if (!lines.length) return undefined;
  return {
    date: safeIso(record.date, new Date().toISOString()),
    lines: lines.slice(0, 4),
    oneThingBlockId:
      typeof record.oneThingBlockId === 'string'
        ? record.oneThingBlockId
        : undefined,
    practiceQuestions: Array.isArray(record.practiceQuestions)
      ? record.practiceQuestions
          .filter((line): line is string => typeof line === 'string')
          .slice(0, 3)
      : undefined,
  };
}

function detectMissedBlocks(blocks: StudyBlock[], now: Date) {
  return blocks.filter((block) => {
    if (block.status === 'done' || block.status === 'missed') return false;
    return dateMs(block.date) + block.durationMin * 60_000 < now.getTime();
  });
}

function findNextAvailableSlot({
  settings,
  existingBlocks,
  durationMin,
  from,
  latestEnd,
}: {
  settings: Settings;
  existingBlocks: StudyBlock[];
  durationMin: number;
  from: Date;
  latestEnd?: Date;
}) {
  const cursor = roundUpMinutes(new Date(from.getTime() + 15 * 60_000), 15);
  for (let dayOffset = 0; dayOffset < 35; dayOffset++) {
    const day = startOfDay(addDays(cursor, dayOffset));
    const weekday = String(day.getDay()) as Weekday;
    for (const window of settings.studyWindows[weekday] ?? []) {
      const windowStart = setTime(day, window.start);
      const windowEnd = setTime(day, window.end);
      let candidate =
        windowStart.getTime() < cursor.getTime()
          ? roundUpMinutes(cursor, 15)
          : windowStart;
      while (
        candidate.getTime() + durationMin * 60_000 <=
        windowEnd.getTime()
      ) {
        const candidateEnd = new Date(
          candidate.getTime() + durationMin * 60_000,
        );
        if (latestEnd && candidateEnd.getTime() > latestEnd.getTime()) break;
        if (
          !overlapsBusy(candidate, candidateEnd, existingBlocks) &&
          !overlapsNoGo(candidate, candidateEnd, settings.noGoTimes)
        ) {
          return candidate;
        }
        candidate = new Date(candidate.getTime() + 15 * 60_000);
      }
    }
  }
  return null;
}

function overlapsBusy(start: Date, end: Date, blocks: StudyBlock[]) {
  return blocks.some((block) => {
    if (block.status === 'done' || block.status === 'missed') return false;
    const blockStart = new Date(block.date);
    const blockEnd = new Date(
      blockStart.getTime() + block.durationMin * 60_000,
    );
    return start < blockEnd && end > blockStart;
  });
}

function overlapsNoGo(start: Date, end: Date, noGoTimes: NoGoTime[]) {
  const weekday = String(start.getDay()) as Weekday;
  const key = dateKey(start);
  return noGoTimes.some((item) => {
    if (item.weekday && item.weekday !== weekday) return false;
    if (item.date && item.date !== key) return false;
    const noGoStart = setTime(startOfDay(start), item.start);
    const noGoEnd = setTime(startOfDay(start), item.end);
    return start < noGoEnd && end > noGoStart;
  });
}

function composeFallbackReport({
  movedBlocks,
  oneThing,
  now,
  hadDayBoundary,
}: {
  movedBlocks: StudyBlock[];
  oneThing?: StudyBlock | undefined;
  now: Date;
  hadDayBoundary: boolean;
}): AgentReport {
  const lines: string[] = [];
  if (movedBlocks.length) {
    lines.push(
      ...movedBlocks
        .slice(0, 2)
        .map(
          (block) =>
            `Moved ${block.subject || block.title} to ${formatBlockTime(block)} — no stress.`,
        ),
    );
    if (movedBlocks.length > 2)
      lines.push(`Rescued ${movedBlocks.length} study blocks gently.`);
  } else if (hadDayBoundary) {
    lines.push('Nothing needed rescuing while you were away.');
  }
  if (oneThing) lines.push(`Picked one focus for today: ${oneThing.title}.`);
  if (!lines.length)
    lines.push('Your plan is still steady. One calm step is enough.');
  return {
    date: now.toISOString(),
    lines: lines.slice(0, 3),
    oneThingBlockId: oneThing?.id,
  };
}

function parseDueInput(value: string, now: Date) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return addDays(now, 2);
  if (normalized === 'today') return endOfDay(now);
  if (normalized === 'tomorrow') return endOfDay(addDays(now, 1));
  const inMatch = normalized.match(/^in\s+(\d+)\s+days?$/);
  if (inMatch) return endOfDay(addDays(now, Number(inMatch[1])));
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? endOfDay(addDays(now, 2)) : parsed;
}

function parseWindow(value: string): TimeRange | null {
  const match = value.match(
    /(\d{1,2})(?::(\d{2}))?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?/,
  );
  if (!match) return null;
  const startHour = Number(match[1]);
  const startMinute = Number(match[2] ?? 0);
  const endHour = Number(match[3]);
  const endMinute = Number(match[4] ?? 0);
  if (
    startHour < 0 ||
    startHour > 23 ||
    endHour < 0 ||
    endHour > 23 ||
    startMinute > 59 ||
    endMinute > 59
  )
    return null;
  const start = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
  const end = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
  return toMinutes(start) < toMinutes(end) ? { start, end } : null;
}

function inferSubject(title: string) {
  const first = title.split(/\s+/)[0];
  return first ? first.replace(/[^a-zа-яё0-9]/gi, '') || 'General' : 'General';
}

function uid(prefix: string) {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

function cleanText(value: string, fallback: string) {
  return value.trim().replace(/\s+/g, ' ').slice(0, 100) || fallback;
}

function clampMinutes(value: number, min: number, max: number) {
  return Math.min(
    max,
    Math.max(min, Number.isFinite(value) ? Math.round(value) : min),
  );
}

function clampHour(value: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(23, Math.max(0, Math.round(value)));
}

function safeIso(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function dateMs(value: string) {
  return new Date(value).getTime();
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    0,
    0,
  );
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function setTime(day: Date, value: string) {
  const [hour = 0, minute = 0] = value.split(':').map(Number);
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    hour,
    minute,
    0,
    0,
  );
}

function toMinutes(value: string) {
  const [hour = 0, minute = 0] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function roundUpMinutes(date: Date, increment: number) {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();
  const next = Math.ceil(minutes / increment) * increment;
  rounded.setMinutes(next, 0, 0);
  return rounded;
}

function weekdays(): Weekday[] {
  return ['0', '1', '2', '3', '4', '5', '6'];
}

function isWeekday(value: unknown): value is Weekday {
  return (
    value === '0' ||
    value === '1' ||
    value === '2' ||
    value === '3' ||
    value === '4' ||
    value === '5' ||
    value === '6'
  );
}
