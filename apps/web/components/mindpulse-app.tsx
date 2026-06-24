'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BellOff,
  BookHeart,
  Check,
  ChevronRight,
  CircleHelp,
  CloudSun,
  Download,
  Feather,
  Heart,
  Home,
  Languages,
  Leaf,
  LockKeyhole,
  LogIn,
  Menu,
  MessageCircle,
  Moon,
  PenLine,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
  Wind,
  X,
} from 'lucide-react';
import {
  EXERCISES,
  suggestExerciseForMood,
  t,
  type Exercise,
  type JournalEntry,
  type Locale,
  type MoodEntry,
  type MoodKey,
} from '@mindpulse/shared';
import {
  clearState,
  DEMO_STATE,
  downloadExport,
  loadState,
  saveState,
  type LocalState,
} from '@/lib/storage';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { uid } from '@/lib/utils';
import { Badge, Button, Card, Input, Textarea } from './ui';
import { CrisisPanel } from './crisis-panel';
import { ExercisePlayer } from './exercise-player';
import { MoodPicker } from './mood-picker';
import { Onboarding } from './onboarding';
import { ChatView } from './chat-view';

type View =
  | 'today'
  | 'chat'
  | 'journal'
  | 'exercises'
  | 'insights'
  | 'safety'
  | 'settings';

const NAV: Array<{
  key: View;
  icon: typeof Home;
  label:
    | 'today'
    | 'companion'
    | 'journal'
    | 'exercises'
    | 'insights'
    | 'safety'
    | 'settings';
}> = [
  { key: 'today', icon: Home, label: 'today' },
  { key: 'chat', icon: MessageCircle, label: 'companion' },
  { key: 'journal', icon: BookHeart, label: 'journal' },
  { key: 'exercises', icon: Wind, label: 'exercises' },
  { key: 'insights', icon: BarChart3, label: 'insights' },
  { key: 'safety', icon: Shield, label: 'safety' },
  { key: 'settings', icon: Settings, label: 'settings' },
];

const TAGS = {
  en: ['school', 'friends', 'family', 'sleep', 'energy', 'alone time'],
  ru: ['учёба', 'друзья', 'семья', 'сон', 'энергия', 'время для себя'],
};
const MOOD_SCORE: Record<MoodKey, number> = {
  rough: 1,
  low: 2,
  okay: 3,
  good: 4,
  great: 5,
};

function updateState(
  setState: React.Dispatch<React.SetStateAction<LocalState | null>>,
  update: (current: LocalState) => LocalState,
) {
  setState((current) => (current ? update(current) : current));
}

export function MindPulseApp() {
  const [state, setState] = useState<LocalState | null>(null);
  const [view, setView] = useState<View>('today');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setState(loadState());
    const savedTheme = localStorage.getItem('mindpulse-theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    setDark(savedTheme ? savedTheme === 'dark' : prefersDark);
  }, []);
  useEffect(() => {
    if (state) saveState(state);
  }, [state]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('mindpulse-theme', dark ? 'dark' : 'light');
  }, [dark]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!state)
    return (
      <div className="flex min-h-screen items-center justify-center text-sage">
        <Heart
          className="animate-pulse"
          fill="currentColor"
          aria-label="Loading MindPulse"
        />
      </div>
    );
  if (!state.onboardingComplete)
    return (
      <Onboarding
        locale={state.locale}
        onLocale={(locale) =>
          updateState(setState, (current) => ({ ...current, locale }))
        }
        onComplete={(name) =>
          updateState(setState, (current) => ({
            ...current,
            onboardingComplete: true,
            name,
          }))
        }
      />
    );

  const locale = state.locale;
  const selectView = (next: View) => {
    setView(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const completeExercise = (exercise: Exercise) => {
    updateState(setState, (current) => ({
      ...current,
      exerciseCompletions: [
        ...current.exerciseCompletions,
        `${exercise.key}:${new Date().toISOString()}`,
      ],
    }));
    setToast(
      locale === 'en'
        ? 'A small moment for yourself — saved.'
        : 'Маленький момент для себя — сохранён.',
    );
  };
  return (
    <div className="ambient min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[280px] border-r border-ink/5 bg-surface/95 p-5 backdrop-blur-xl transition-transform lg:visible lg:sticky lg:top-0 lg:block lg:h-screen lg:w-auto lg:translate-x-0 ${menuOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'}`}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => selectView('today')}
            className="flex items-center gap-3 rounded-xl text-left focus-visible:ring-2 focus-visible:ring-sage"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-soft text-sage">
              <Heart size={19} fill="currentColor" />
            </span>
            <span>
              <strong className="block text-lg leading-5">MindPulse</strong>
              <small className="text-xs text-muted">by Northlight</small>
            </span>
          </button>
          <button
            className="rounded-full p-2 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>
        <nav className="mt-9 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => selectView(item.key)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-sage ${active ? 'bg-sage-soft text-ink' : 'text-muted hover:bg-canvas hover:text-ink'}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={19} strokeWidth={active ? 2.4 : 1.8} aria-hidden />
                {t(locale, item.label)}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-canvas p-4">
          <p className="text-xs font-bold text-ink">
            {locale === 'en' ? 'A gentle reminder' : 'Мягкое напоминание'}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            {locale === 'en'
              ? 'You never owe this app your time. A break counts too.'
              : 'Ты ничего не должен(на) этому приложению. Перерыв тоже важен.'}
          </p>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-ink/5 bg-canvas/85 px-4 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl p-2 hover:bg-surface lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu />
            </button>
            <div>
              <h1 className="font-semibold">
                {t(
                  locale,
                  NAV.find((item) => item.key === view)?.label ?? 'today',
                )}
              </h1>
              <p className="hidden text-xs text-muted sm:block">
                {t(locale, 'brandTagline')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark((value) => !value)}
              className="rounded-full border border-ink/5 bg-surface p-2.5 text-muted shadow-sm hover:text-ink"
              aria-label={dark ? 'Use light theme' : 'Use dark theme'}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a
              href="/login"
              className="hidden items-center gap-2 rounded-full border border-ink/5 bg-surface px-4 py-2.5 text-sm font-semibold text-muted shadow-sm hover:text-ink sm:flex"
            >
              <UserRound size={17} />
              {locale === 'en' ? 'Demo profile' : 'Демо-профиль'}
            </a>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto max-w-6xl px-4 pb-28 pt-7 sm:px-8 sm:pt-10 lg:px-10 lg:pb-12"
        >
          {view === 'today' && (
            <Today
              state={state}
              setState={setState}
              locale={locale}
              onView={selectView}
              onExercise={setActiveExercise}
              notify={setToast}
            />
          )}
          {view === 'chat' && (
            <Chat state={state} setState={setState} locale={locale} />
          )}
          {view === 'journal' && (
            <Journal
              state={state}
              setState={setState}
              locale={locale}
              notify={setToast}
            />
          )}
          {view === 'exercises' && (
            <Exercises
              locale={locale}
              completions={state.exerciseCompletions}
              onOpen={setActiveExercise}
            />
          )}
          {view === 'insights' && <Insights state={state} locale={locale} />}
          {view === 'safety' && <SafetyHub locale={locale} />}
          {view === 'settings' && (
            <SettingsView
              state={state}
              setState={setState}
              dark={dark}
              setDark={setDark}
              notify={setToast}
            />
          )}
        </main>
      </div>

      <nav
        className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-2xl border border-white/30 bg-surface/95 p-1.5 shadow-2xl backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        {NAV.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => selectView(item.key)}
              className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold ${active ? 'bg-sage-soft text-ink' : 'text-muted'}`}
            >
              <Icon size={19} />
              <span>{t(locale, item.label)}</span>
            </button>
          );
        })}
      </nav>
      {activeExercise && (
        <ExercisePlayer
          exercise={activeExercise}
          locale={locale}
          onClose={() => setActiveExercise(null)}
          onComplete={() => completeExercise(activeExercise)}
        />
      )}
      {toast && (
        <div
          className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas shadow-xl lg:bottom-6"
          role="status"
        >
          <Check className="mr-2 inline" size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}

function Today({
  state,
  setState,
  locale,
  onView,
  onExercise,
  notify,
}: {
  state: LocalState;
  setState: React.Dispatch<React.SetStateAction<LocalState | null>>;
  locale: Locale;
  onView: (view: View) => void;
  onExercise: (exercise: Exercise) => void;
  notify: (message: string) => void;
}) {
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const name = state.name ? `, ${state.name}` : '';
  const suggestionMood = mood ?? state.moods[0]?.mood;
  const suggestion = suggestionMood
    ? suggestExerciseForMood(suggestionMood, locale)
    : null;
  const saveMood = () => {
    if (!mood) return;
    const entry: MoodEntry = {
      id: uid('mood'),
      userId: 'demo',
      mood,
      intensity,
      tags,
      createdAt: new Date().toISOString(),
    };
    updateState(setState, (current) => ({
      ...current,
      moods: [entry, ...current.moods],
    }));
    setMood(null);
    setTags([]);
    notify(
      locale === 'en'
        ? 'Check-in saved privately.'
        : 'Отметка сохранена приватно.',
    );
  };
  return (
    <div className="animate-rise">
      <div className="mb-8">
        <Badge>
          <CloudSun className="mr-1.5" size={14} />
          {locale === 'en' ? 'Take your time' : 'Не спеши'}
        </Badge>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
          {locale === 'en'
            ? `Good to see you${name}.`
            : `Рады видеть тебя${name}.`}
        </h2>
        <p className="mt-3 max-w-xl leading-7 text-muted">
          {t(locale, 'greetingSub')}
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Card className="p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
                {t(locale, 'moodPrompt')}
              </p>
              <h3 className="mt-2 text-xl font-semibold">
                {t(locale, 'greeting')}
              </h3>
            </div>
            <LockKeyhole
              className="text-muted"
              size={18}
              aria-label={t(locale, 'privacyNote')}
            />
          </div>
          <div className="mt-5">
            <MoodPicker value={mood} onChange={setMood} locale={locale} />
          </div>
          {mood && (
            <div className="mt-6 animate-rise border-t border-ink/5 pt-5">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted">
                  {locale === 'en' ? 'Intensity' : 'Сила'}
                </span>
                <input
                  className="w-full accent-sage"
                  type="range"
                  min={1}
                  max={5}
                  value={intensity}
                  onChange={(event) => setIntensity(Number(event.target.value))}
                  aria-label="Mood intensity"
                />
                <strong className="w-6 text-center">{intensity}</strong>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {TAGS[locale].map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setTags((items) =>
                        items.includes(tag)
                          ? items.filter((item) => item !== tag)
                          : [...items, tag],
                      )
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${tags.includes(tag) ? 'border-sage bg-sage-soft text-ink' : 'border-ink/10 text-muted'}`}
                    aria-pressed={tags.includes(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <Button className="mt-5 w-full sm:w-auto" onClick={saveMood}>
                {t(locale, 'saveCheckIn')}
              </Button>
            </div>
          )}
        </Card>
        <Card className="overflow-hidden bg-gradient-to-br from-sage-soft to-mist p-6">
          <div className="flex h-full flex-col justify-between">
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface/70 text-sage">
                <MessageCircle size={20} />
              </span>
              <h3 className="mt-5 text-xl font-semibold">
                {t(locale, 'talk')}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {t(locale, 'talkSub')}
              </p>
            </div>
            <Button className="mt-6 w-full" onClick={() => onView('chat')}>
              {locale === 'en' ? 'Open conversation' : 'Открыть разговор'}
              <ChevronRight size={17} />
            </Button>
          </div>
        </Card>
      </div>
      {suggestion ? (
        <Card className="mt-5 overflow-hidden border-sage/15 bg-gradient-to-r from-lavender/50 via-surface to-sage-soft/70 p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <Badge className="bg-warm/20 text-ink">
                <Sparkles className="mr-1.5" size={14} />
                {locale === 'en'
                  ? 'Chosen for your check-in'
                  : 'Подобрано к твоей отметке'}
              </Badge>
              <h3 className="mt-3 text-xl font-semibold">
                {suggestion.exercise.title[locale]}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {suggestion.reason}
              </p>
            </div>
            <Button
              className="w-full shrink-0 sm:w-auto"
              onClick={() => onExercise(suggestion.exercise)}
            >
              {locale === 'en' ? 'Try this practice' : 'Попробовать практику'}
              <ChevronRight size={17} />
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="mt-5 border-dashed p-5 text-sm text-muted">
          {locale === 'en'
            ? 'Choose a mood and MindPulse will offer one gentle practice for this moment.'
            : 'Выбери настроение, и MindPulse предложит одну бережную практику для этого момента.'}
        </Card>
      )}
      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
              {locale === 'en' ? 'For this moment' : 'Для этого момента'}
            </p>
            <h3 className="mt-2 text-2xl font-semibold">
              {locale === 'en' ? 'A small reset' : 'Небольшая перезагрузка'}
            </h3>
          </div>
          <button
            onClick={() => onView('exercises')}
            className="text-sm font-semibold text-sage hover:underline"
          >
            {locale === 'en' ? 'See all' : 'Все практики'}
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {EXERCISES.slice(0, 3).map((exercise, index) => (
            <button
              key={exercise.key}
              onClick={() => onExercise(exercise)}
              className="group rounded-mp border border-ink/5 bg-surface p-5 text-left shadow-soft transition hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-sage"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${index === 0 ? 'bg-sage-soft' : index === 1 ? 'bg-mist' : 'bg-lavender'}`}
              >
                {index === 0 ? (
                  <Wind size={19} />
                ) : index === 1 ? (
                  <Leaf size={19} />
                ) : (
                  <Feather size={19} />
                )}
              </span>
              <h4 className="mt-4 font-semibold">{exercise.title[locale]}</h4>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                {exercise.summary[locale]}
              </p>
              <span className="mt-4 inline-block text-xs font-bold text-sage">
                {exercise.minutes} min · {locale === 'en' ? 'Start' : 'Начать'}{' '}
                →
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Chat({
  state,
  setState,
  locale,
}: {
  state: LocalState;
  setState: React.Dispatch<React.SetStateAction<LocalState | null>>;
  locale: Locale;
}) {
  return <ChatView state={state} setState={setState} locale={locale} />;
}

function Journal({
  state,
  setState,
  locale,
  notify,
}: {
  state: LocalState;
  setState: React.Dispatch<React.SetStateAction<LocalState | null>>;
  locale: Locale;
  notify: (message: string) => void;
}) {
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const prompts =
    locale === 'en'
      ? [
          'What drained some energy today?',
          'What felt a little lighter?',
          'What do you wish someone understood?',
        ]
      : [
          'Что сегодня забрало часть энергии?',
          'Что принесло немного лёгкости?',
          'Что бы ты хотел(а), чтобы кто-то понял?',
        ];
  const save = () => {
    if (!title.trim() || !body.trim()) return;
    const now = new Date().toISOString();
    if (editing)
      updateState(setState, (current) => ({
        ...current,
        journals: current.journals.map((entry) =>
          entry.id === editing.id
            ? {
                ...entry,
                title: title.trim(),
                body: body.trim(),
                updatedAt: now,
              }
            : entry,
        ),
      }));
    else {
      const entry: JournalEntry = {
        id: uid('journal'),
        userId: 'demo',
        title: title.trim(),
        body: body.trim(),
        createdAt: now,
        updatedAt: now,
      };
      updateState(setState, (current) => ({
        ...current,
        journals: [entry, ...current.journals],
      }));
    }
    setEditing(null);
    setTitle('');
    setBody('');
    notify(
      locale === 'en'
        ? 'Journal entry saved privately.'
        : 'Запись сохранена приватно.',
    );
  };
  const edit = (entry: JournalEntry) => {
    setEditing(entry);
    setTitle(entry.title);
    setBody(entry.body);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const remove = (id: string) => {
    if (
      !window.confirm(
        locale === 'en' ? 'Delete this journal entry?' : 'Удалить эту запись?',
      )
    )
      return;
    updateState(setState, (current) => ({
      ...current,
      journals: current.journals.filter((entry) => entry.id !== id),
    }));
  };
  return (
    <div className="animate-rise">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge>
            <LockKeyhole className="mr-1.5" size={14} />
            {t(locale, 'privacyNote')}
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold">
            {locale === 'en'
              ? 'A page with no audience'
              : 'Страница без зрителей'}
          </h2>
          <p className="mt-2 max-w-xl leading-7 text-muted">
            {locale === 'en'
              ? 'Write freely. It can be unfinished, messy, or just one sentence.'
              : 'Пиши свободно. Можно незаконченно, неидеально или всего одно предложение.'}
          </p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <Card className="p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {editing
                ? locale === 'en'
                  ? 'Edit entry'
                  : 'Изменить запись'
                : locale === 'en'
                  ? 'New entry'
                  : 'Новая запись'}
            </h3>
            {editing && (
              <button
                onClick={() => {
                  setEditing(null);
                  setTitle('');
                  setBody('');
                }}
                className="rounded-full p-2 text-muted hover:bg-canvas"
                aria-label="Cancel edit"
              >
                <X size={17} />
              </button>
            )}
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setTitle(prompt);
                  if (!body) setBody('');
                }}
                className="shrink-0 rounded-full bg-canvas px-3 py-2 text-xs font-medium text-muted hover:text-ink"
              >
                {prompt}
              </button>
            ))}
          </div>
          <Input
            className="mt-4 border-0 bg-transparent px-0 text-xl font-semibold focus:ring-0"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={
              locale === 'en'
                ? 'Give this moment a name'
                : 'Дай этому моменту название'
            }
            maxLength={120}
          />
          <Textarea
            className="mt-3 min-h-64 border-0 bg-canvas/70 p-4 focus:ring-1"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={t(locale, 'journalPrompt')}
            maxLength={20000}
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted">
              {body.length.toLocaleString()} / 20,000
            </span>
            <Button onClick={save} disabled={!title.trim() || !body.trim()}>
              <PenLine size={16} />
              {t(locale, 'save')}
            </Button>
          </div>
        </Card>
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">
              {locale === 'en' ? 'Earlier pages' : 'Предыдущие страницы'}
            </h3>
            <Badge className="bg-canvas text-muted">
              {state.journals.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {state.journals.length === 0 ? (
              <Card className="p-8 text-center">
                <BookHeart className="mx-auto text-sage" />
                <p className="mt-3 font-medium">
                  {locale === 'en'
                    ? 'Your journal starts here.'
                    : 'Твой дневник начинается здесь.'}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {locale === 'en'
                    ? 'No pressure to fill the page.'
                    : 'Необязательно заполнять всю страницу.'}
                </p>
              </Card>
            ) : (
              state.journals.map((entry) => (
                <Card key={entry.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate font-semibold">{entry.title}</h4>
                      <time className="mt-1 block text-xs text-muted">
                        {new Intl.DateTimeFormat(locale, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }).format(new Date(entry.updatedAt))}
                      </time>
                    </div>
                    <div className="flex">
                      <button
                        className="rounded-full p-2 text-muted hover:bg-canvas"
                        onClick={() => edit(entry)}
                        aria-label="Edit"
                      >
                        <PenLine size={15} />
                      </button>
                      <button
                        className="rounded-full p-2 text-muted hover:bg-red-50 hover:text-danger"
                        onClick={() => remove(entry.id)}
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-muted">
                    {entry.body}
                  </p>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Exercises({
  locale,
  completions,
  onOpen,
}: {
  locale: Locale;
  completions: string[];
  onOpen: (exercise: Exercise) => void;
}) {
  const iconFor = (category: Exercise['category']) =>
    category === 'calm'
      ? Wind
      : category === 'ground'
        ? Leaf
        : category === 'reflect'
          ? Feather
          : Moon;
  return (
    <div className="animate-rise">
      <Badge>
        <Leaf className="mr-1.5" size={14} />
        {locale === 'en' ? 'No score. No streak.' : 'Без баллов и серий.'}
      </Badge>
      <h2 className="mt-4 text-3xl font-semibold">
        {locale === 'en'
          ? 'Short practices for real days'
          : 'Короткие практики для обычных дней'}
      </h2>
      <p className="mt-2 max-w-2xl leading-7 text-muted">
        {locale === 'en'
          ? 'Choose what fits the moment. Stop anytime if an exercise feels uncomfortable.'
          : 'Выбери то, что подходит сейчас. Остановись в любой момент, если практика вызывает дискомфорт.'}
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {EXERCISES.map((exercise, index) => {
          const Icon = iconFor(exercise.category);
          const count = completions.filter((value) =>
            value.startsWith(`${exercise.key}:`),
          ).length;
          return (
            <Card key={exercise.key} className="group overflow-hidden p-6">
              <div className="flex items-start justify-between">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${['bg-sage-soft', 'bg-mist', 'bg-lavender', 'bg-sand text-mood-ink'][index]}`}
                >
                  <Icon size={22} />
                </span>
                <span className="text-xs font-semibold text-muted">
                  {exercise.minutes} {locale === 'en' ? 'min' : 'мин'}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold">
                {exercise.title[locale]}
              </h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-muted">
                {exercise.summary[locale]}
              </p>
              <div className="mt-5 flex items-center justify-between">
                <Button variant="secondary" onClick={() => onOpen(exercise)}>
                  {locale === 'en' ? 'Begin' : 'Начать'}
                  <ChevronRight size={16} />
                </Button>
                {count > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Check size={14} />
                    {locale === 'en' ? 'Used before' : 'Уже пробовал(а)'}
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      <p className="mx-auto mt-8 max-w-xl text-center text-sm leading-6 text-muted">
        {locale === 'en'
          ? 'These exercises are educational wellbeing tools, not treatment. There is no “perfect” way to do them.'
          : 'Эти практики помогают поддерживать благополучие, но не являются лечением. Не существует «идеального» способа их выполнять.'}
      </p>
    </div>
  );
}

function MoodChart({ moods, locale }: { moods: MoodEntry[]; locale: Locale }) {
  const points = [...moods]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(-7);
  if (!points.length)
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl bg-canvas text-sm text-muted">
        {locale === 'en'
          ? 'Your first check-in will appear here.'
          : 'Здесь появится твоя первая отметка.'}
      </div>
    );
  return (
    <div
      className="flex h-52 items-end gap-2 rounded-2xl bg-canvas p-4"
      role="img"
      aria-label={
        locale === 'en'
          ? 'Recent mood trend from low to high'
          : 'Недавнее изменение настроения от низкого к высокому'
      }
    >
      {points.map((point) => (
        <div
          key={point.id}
          className="flex h-full flex-1 flex-col items-center justify-end gap-2"
        >
          <span className="text-xs font-bold text-sage">
            {MOOD_SCORE[point.mood]}
          </span>
          <div
            className="w-full max-w-10 rounded-t-xl bg-gradient-to-t from-sage to-[#9bc0b5]"
            style={{ height: `${MOOD_SCORE[point.mood] * 17}%` }}
          />
          <span className="text-[10px] text-muted">
            {new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
              new Date(point.createdAt),
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function Insights({ state, locale }: { state: LocalState; locale: Locale }) {
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    state.moods.forEach((mood) =>
      mood.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)),
    );
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [state.moods]);
  const average = state.moods.length
    ? state.moods.reduce((sum, item) => sum + MOOD_SCORE[item.mood], 0) /
      state.moods.length
    : 0;
  return (
    <div className="animate-rise">
      <Badge>
        <BarChart3 className="mr-1.5" size={14} />
        {locale === 'en'
          ? 'Patterns, not predictions'
          : 'Закономерности, не прогнозы'}
      </Badge>
      <h2 className="mt-4 text-3xl font-semibold">
        {locale === 'en' ? 'A gentle look back' : 'Бережный взгляд назад'}
      </h2>
      <p className="mt-2 max-w-2xl leading-7 text-muted">
        {locale === 'en'
          ? 'Your check-ins can show patterns, but they cannot diagnose or explain how you feel.'
          : 'Отметки могут показать закономерности, но не поставить диагноз и не объяснить твои чувства.'}
      </p>
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <Card className="p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">
                {locale === 'en' ? 'Recent mood' : 'Недавнее настроение'}
              </p>
              <p className="mt-1 text-xs text-muted">
                {locale === 'en' ? 'Last 7 check-ins' : 'Последние 7 отметок'}
              </p>
            </div>
            <Badge className="bg-sage-soft">
              {state.moods.length} {locale === 'en' ? 'total' : 'всего'}
            </Badge>
          </div>
          <div className="mt-5">
            <MoodChart moods={state.moods} locale={locale} />
          </div>
        </Card>
        <div className="space-y-5">
          <Card className="p-6">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
              {locale === 'en' ? 'A simple average' : 'Простое среднее'}
            </p>
            <p className="mt-3 text-4xl font-light">
              {average ? average.toFixed(1) : '—'}
              <span className="text-lg text-muted"> / 5</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {locale === 'en'
                ? 'A snapshot of logged moments—not a grade or clinical score.'
                : 'Снимок отмеченных моментов, а не оценка или клинический показатель.'}
            </p>
          </Card>
          <Card className="p-6">
            <p className="font-semibold">
              {locale === 'en'
                ? 'What shows up often'
                : 'Что встречается часто'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.length ? (
                tags.map(([tag, count]) => (
                  <Badge key={tag} className="bg-canvas text-muted">
                    {tag} · {count}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted">
                  {locale === 'en'
                    ? 'Tags will collect here over time.'
                    : 'Со временем здесь появятся теги.'}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
      <Card className="mt-5 border-lavender bg-lavender/30 p-5">
        <div className="flex gap-3">
          <Sparkles className="shrink-0 text-sage" size={20} />
          <p className="text-sm leading-6 text-muted">
            <strong className="text-ink">
              {locale === 'en'
                ? 'A non-judgmental note: '
                : 'Безоценочное наблюдение: '}
            </strong>
            {locale === 'en'
              ? 'You have been making space to notice how you feel. That awareness can be useful on its own; no trend needs to be “fixed.”'
              : 'Ты находишь время замечать свои чувства. Эта осознанность ценна сама по себе; никакую тенденцию не нужно обязательно «исправлять».'}
          </p>
        </div>
      </Card>
    </div>
  );
}

function SafetyHub({ locale }: { locale: Locale }) {
  const principles =
    locale === 'en'
      ? [
          [
            'Not emergency care',
            'MindPulse cannot contact emergency services, monitor your safety, or replace immediate human help.',
          ],
          [
            'No diagnosis',
            'The companion supports reflection and everyday coping. It does not diagnose, prescribe, or provide treatment.',
          ],
          [
            'Bring in a person',
            'For difficult or unsafe situations, a trusted adult, counselor, teacher, relative, or local service can offer real-world support.',
          ],
          [
            'Your control',
            'You can export your information or delete your account and stored data from Settings.',
          ],
        ]
      : [
          [
            'Не экстренная помощь',
            'MindPulse не может связаться с экстренной службой, следить за твоей безопасностью или заменить срочную помощь человека.',
          ],
          [
            'Без диагнозов',
            'Собеседник помогает размышлять и справляться с повседневными трудностями. Он не ставит диагнозы и не назначает лечение.',
          ],
          [
            'Подключи человека',
            'В трудной или опасной ситуации взрослый, психолог, учитель, родственник или местная служба могут помочь в реальном мире.',
          ],
          [
            'Ты управляешь данными',
            'В Настройках можно скачать информацию или удалить аккаунт и сохранённые данные.',
          ],
        ];
  return (
    <div className="animate-rise">
      <Badge>
        <Shield className="mr-1.5" size={14} />
        {locale === 'en' ? 'Always within reach' : 'Всегда под рукой'}
      </Badge>
      <h2 className="mt-4 text-3xl font-semibold">
        {locale === 'en' ? 'Resources & safety' : 'Ресурсы и безопасность'}
      </h2>
      <p className="mt-2 max-w-2xl leading-7 text-muted">
        {locale === 'en'
          ? 'Clear support for urgent moments—and honest limits about what MindPulse can do.'
          : 'Понятная поддержка в срочные моменты и честные границы возможностей MindPulse.'}
      </p>
      <div className="mt-8">
        <CrisisPanel locale={locale} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {principles.map(([title, body], index) => (
          <Card key={title} className="p-5">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${index % 2 ? 'bg-mist' : 'bg-sage-soft'}`}
            >
              {index === 0 ? (
                <CircleHelp size={19} />
              ) : index === 1 ? (
                <Shield size={19} />
              ) : index === 2 ? (
                <UserRound size={19} />
              ) : (
                <LockKeyhole size={19} />
              )}
            </span>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6 p-6">
        <h3 className="font-semibold">
          {locale === 'en'
            ? 'How the AI safety layer works'
            : 'Как работает безопасность ИИ'}
        </h3>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            locale === 'en'
              ? 'Your message is checked for urgent safety signals before any model is called.'
              : 'До обращения к модели сообщение проверяется на срочные сигналы опасности.',
            locale === 'en'
              ? 'If a signal appears, a fixed, reviewed response replaces improvisation.'
              : 'Если сигнал найден, импровизацию заменяет проверенный фиксированный ответ.',
            locale === 'en'
              ? 'Every generated answer is screened again before any of it reaches you.'
              : 'Каждый созданный ответ снова проверяется до того, как ты его увидишь.',
          ].map((body, index) => (
            <li
              key={body}
              className="rounded-2xl bg-canvas p-4 text-sm leading-6 text-muted"
            >
              <strong className="mb-2 block text-sage">0{index + 1}</strong>
              {body}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function SettingsView({
  state,
  setState,
  dark,
  setDark,
  notify,
}: {
  state: LocalState;
  setState: React.Dispatch<React.SetStateAction<LocalState | null>>;
  dark: boolean;
  setDark: (value: boolean) => void;
  notify: (message: string) => void;
}) {
  const locale = state.locale;
  const [notifications, setNotifications] = useState(false);
  const deleteAccount = async () => {
    const confirmed = window.confirm(
      locale === 'en'
        ? 'Delete all MindPulse data in this browser? This cannot be undone.'
        : 'Удалить все данные MindPulse в этом браузере? Это действие нельзя отменить.',
    );
    if (!confirmed) return;
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session) await supabase.rpc('delete_current_user_data');
      await supabase.auth.signOut();
    }
    clearState();
    setState({ ...DEMO_STATE });
  };
  return (
    <div className="mx-auto max-w-3xl animate-rise">
      <h2 className="text-3xl font-semibold">{t(locale, 'settings')}</h2>
      <p className="mt-2 leading-7 text-muted">
        {locale === 'en'
          ? 'Simple controls, with privacy in plain language.'
          : 'Понятные настройки и приватность простыми словами.'}
      </p>
      <div className="mt-7 space-y-4">
        <Card className="divide-y divide-ink/5 overflow-hidden">
          <SettingRow
            icon={UserRound}
            title={locale === 'en' ? 'Profile' : 'Профиль'}
            detail={
              state.name ||
              (locale === 'en' ? 'No display name' : 'Имя не указано')
            }
          >
            <a
              href="/login"
              className="flex items-center gap-2 rounded-full bg-canvas px-3 py-2 text-xs font-semibold"
            >
              <LogIn size={15} />
              {locale === 'en' ? 'Sign in' : 'Войти'}
            </a>
          </SettingRow>
          <SettingRow
            icon={Languages}
            title={locale === 'en' ? 'Language' : 'Язык'}
            detail="English / Русский"
          >
            <div className="flex rounded-full bg-canvas p-1">
              {(['en', 'ru'] as const).map((item) => (
                <button
                  key={item}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${state.locale === item ? 'bg-surface shadow-sm' : 'text-muted'}`}
                  onClick={() =>
                    updateState(setState, (current) => ({
                      ...current,
                      locale: item,
                    }))
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow
            icon={dark ? Moon : Sun}
            title={locale === 'en' ? 'Appearance' : 'Оформление'}
            detail={
              dark
                ? locale === 'en'
                  ? 'Dark'
                  : 'Тёмное'
                : locale === 'en'
                  ? 'Light'
                  : 'Светлое'
            }
          >
            <button
              role="switch"
              aria-checked={dark}
              onClick={() => setDark(!dark)}
              className={`relative h-7 w-12 rounded-full transition ${dark ? 'bg-sage' : 'bg-ink/15'}`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${dark ? 'left-6' : 'left-1'}`}
              />
            </button>
          </SettingRow>
          <SettingRow
            icon={BellOff}
            title={locale === 'en' ? 'Gentle reminders' : 'Мягкие напоминания'}
            detail={
              locale === 'en'
                ? 'Off by default. No streak nudges.'
                : 'Выключены по умолчанию. Без давления сериями.'
            }
          >
            <button
              role="switch"
              aria-checked={notifications}
              onClick={() => {
                setNotifications((value) => !value);
                notify(
                  locale === 'en'
                    ? 'Reminder preference updated.'
                    : 'Настройка напоминаний обновлена.',
                );
              }}
              className={`relative h-7 w-12 rounded-full transition ${notifications ? 'bg-sage' : 'bg-ink/15'}`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${notifications ? 'left-6' : 'left-1'}`}
              />
            </button>
          </SettingRow>
        </Card>
        <Card className="overflow-hidden">
          <SettingRow
            icon={Download}
            title={locale === 'en' ? 'Export my data' : 'Скачать мои данные'}
            detail={
              locale === 'en'
                ? 'Download a readable JSON copy.'
                : 'Скачать понятную копию в JSON.'
            }
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={() => downloadExport(state)}
            >
              <Download size={15} />
              {locale === 'en' ? 'Export' : 'Скачать'}
            </Button>
          </SettingRow>
          <SettingRow
            icon={Trash2}
            title={
              locale === 'en'
                ? 'Delete account & data'
                : 'Удалить аккаунт и данные'
            }
            detail={
              locale === 'en'
                ? 'Permanent after confirmation.'
                : 'Безвозвратно после подтверждения.'
            }
          >
            <Button variant="danger" size="sm" onClick={deleteAccount}>
              {locale === 'en' ? 'Delete' : 'Удалить'}
            </Button>
          </SettingRow>
        </Card>
        <Card className="bg-sage-soft/50 p-5">
          <h3 className="flex items-center gap-2 font-semibold">
            <LockKeyhole size={18} />
            {locale === 'en'
              ? 'Privacy, without the maze'
              : 'Приватность без лабиринта'}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            {locale === 'en'
              ? 'MindPulse stores only what is needed to provide your private journal, check-ins, and conversations. Supabase row-level security isolates every account. Demo-mode data stays in this browser.'
              : 'MindPulse хранит только то, что нужно для приватного дневника, отметок и разговоров. Политики Supabase изолируют каждый аккаунт. Демо-данные остаются в этом браузере.'}
          </p>
        </Card>
        <p className="text-center text-xs text-muted">
          MindPulse 0.2 · Built with care by Northlight ·{' '}
          <a href="/style" className="font-semibold text-sage hover:underline">
            Style reference
          </a>
        </p>
      </div>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  detail,
  children,
}: {
  icon: typeof Settings;
  title: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-4 sm:p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-canvas text-sage">
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-0.5 text-xs leading-5 text-muted">{detail}</p>
      </div>
      {children}
    </div>
  );
}
