export type LanguageCode = 'en' | 'ru' | 'kk';
export type ToolIconId =
  | 'book'
  | 'calendar'
  | 'repeat'
  | 'sparkles'
  | 'target'
  | 'zap';
export type ModeId =
  | 'study'
  | 'planner'
  | 'motivation'
  | 'habit'
  | 'goal'
  | 'reflection';

export type ToolIntakeField = {
  id: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
  maxLength: number;
};

export type MindPulseTool = {
  id: ModeId;
  route: string;
  title: string;
  shortTitle: string;
  headline: string;
  copy: string;
  explanation: string;
  outcome: string;
  bestFor: string[];
  emptyHint: string;
  iconId: ToolIconId;
  examples: string[];
  /** Guided inputs that compose a structured first message. */
  intake: ToolIntakeField[];
};

export const languages: Array<{
  id: LanguageCode;
  label: string;
  prompt: string;
}> = [
  { id: 'en', label: 'English', prompt: 'English' },
  { id: 'ru', label: 'Русский', prompt: 'Russian' },
  // Kazakh is labeled beta until safety patterns and copy get native review.
  { id: 'kk', label: 'Қазақша (beta)', prompt: 'Kazakh' },
];

export const mindPulseTools: MindPulseTool[] = [
  {
    id: 'study',
    route: '/study',
    title: 'Study Help',
    shortTitle: 'Study',
    headline: 'Understand faster, remember longer.',
    copy: 'Explain topics, create examples, and practice smarter.',
    explanation:
      'Use this when a topic feels blurry and you want a calm explanation, a simple example, or a few practice questions.',
    outcome:
      'Best results come from sharing the subject, your deadline, and what feels confusing.',
    bestFor: ['Exam preparation', 'Difficult topics', 'Study plans'],
    emptyHint:
      'Start with the topic, your current level, and what you need next: explanation, quiz, summary, or plan.',
    iconId: 'book',
    examples: [
      'I have a biology exam in 3 days. Build a study plan using active recall and practice questions.',
      'Explain quadratic functions step by step, then quiz me with 5 questions.',
      'Turn these rough class notes into a one-page study guide with key terms and mistakes to avoid.',
    ],
    intake: [
      {
        id: 'subject',
        label: 'Subject or topic',
        placeholder: 'e.g. Quadratic functions',
        maxLength: 120,
      },
      {
        id: 'deadline',
        label: 'Exam or deadline (optional)',
        placeholder: 'e.g. Friday',
        maxLength: 60,
      },
      {
        id: 'struggle',
        label: 'What feels confusing?',
        placeholder: 'e.g. I mix up the formula steps…',
        multiline: true,
        maxLength: 300,
      },
    ],
  },
  {
    id: 'planner',
    route: '/planner',
    title: 'Daily Planner',
    shortTitle: 'Planner',
    headline: 'Turn a messy day into a realistic plan.',
    copy: 'Turn a messy day into realistic time blocks.',
    explanation:
      'Use this when your tasks are scattered and you need a plan that respects your real energy, deadlines, and breaks.',
    outcome:
      'Share your tasks, available time, and non-negotiables so MindPulse can sort the day without pretending you are a robot.',
    bestFor: ['Daily plans', 'Weekly planning', 'Priority sorting'],
    emptyHint:
      'List your tasks, deadlines, available time, and energy level. MindPulse will turn it into next actions.',
    iconId: 'calendar',
    examples: [
      'Plan my day from 4pm to 10pm with homework, dinner, and one real break.',
      'Sort these tasks by urgency and importance, then tell me what to do first: math, essay, flashcards, laundry.',
      'Build a weekly exam-prep plan that leaves room for rest and unexpected homework.',
    ],
    intake: [
      {
        id: 'tasks',
        label: 'Tasks on your plate',
        placeholder: 'e.g. Math homework, essay draft, flashcards…',
        multiline: true,
        maxLength: 300,
      },
      {
        id: 'time',
        label: 'Time you actually have',
        placeholder: 'e.g. 4pm to 9pm with dinner in between',
        maxLength: 120,
      },
    ],
  },
  {
    id: 'motivation',
    route: '/motivation',
    title: 'Motivation Reset',
    shortTitle: 'Motivation',
    headline: 'Get unstuck without yelling at yourself.',
    copy: 'Find the smallest useful next step when you feel stuck.',
    explanation:
      'Use this when you are procrastinating, tired, or overwhelmed and need a gentle reset instead of pressure.',
    outcome:
      'Tell MindPulse what you are avoiding and how much energy you have. It will help you restart with one small move.',
    bestFor: [
      'Getting unstuck',
      'Confidence resets',
      'Discipline without guilt',
    ],
    emptyHint:
      'Describe what you are avoiding and why it feels heavy. MindPulse will find the smallest useful first step.',
    iconId: 'zap',
    examples: [
      'I wasted the afternoon and feel behind. Give me a calm 20-minute reset plan.',
      'I cannot start my essay because it feels too big. Make the first step tiny and specific.',
      'Help me rebuild confidence after a bad test without pretending everything is fine.',
    ],
    intake: [
      {
        id: 'avoiding',
        label: 'What are you avoiding?',
        placeholder: 'e.g. Starting my essay — it feels too big…',
        multiline: true,
        maxLength: 300,
      },
      {
        id: 'energy',
        label: 'Energy right now',
        placeholder: 'e.g. Pretty low, tired after school',
        maxLength: 120,
      },
    ],
  },
  {
    id: 'habit',
    route: '/habits',
    title: 'Habit Coach',
    shortTitle: 'Habits',
    headline: 'Build routines that survive real life.',
    copy: 'Build routines that survive busy student days.',
    explanation:
      'Use this when you want a routine that is forgiving, small enough to repeat, and not based on guilt.',
    outcome:
      'Give MindPulse the habit, your usual obstacle, and a realistic time window. It will design a routine you can actually repeat.',
    bestFor: ['Habit building', 'Consistency', 'Simple routines'],
    emptyHint:
      'Name the habit, when you want it to happen, and what usually breaks it. MindPulse will make it smaller and repeatable.',
    iconId: 'repeat',
    examples: [
      'Help me build a 10-minute study habit that works even on busy school days.',
      'Design a morning routine for class days that does not collapse if I wake up late.',
      'I keep breaking habits after 3 days. Make a forgiving reset plan with a backup version.',
    ],
    intake: [
      {
        id: 'habit',
        label: 'Habit you want to build',
        placeholder: 'e.g. 10 minutes of review after dinner',
        maxLength: 120,
      },
      {
        id: 'obstacle',
        label: 'What usually breaks it?',
        placeholder: 'e.g. I get distracted by my phone…',
        multiline: true,
        maxLength: 300,
      },
    ],
  },
  {
    id: 'goal',
    route: '/goals',
    title: 'Goal Breakdown',
    shortTitle: 'Goals',
    headline: 'Make big goals small enough to start.',
    copy: 'Break large goals into milestones and next actions.',
    explanation:
      'Use this when a goal is too big to hold in your head and you need it split into visible, doable steps.',
    outcome:
      'Share the goal, why it matters, and when you want progress. MindPulse will turn it into milestones and next actions.',
    bestFor: ['Big goals', 'Portfolio goals', 'Academic and career goals'],
    emptyHint:
      'Write the big goal and your rough deadline. MindPulse will split it into milestones, weekly steps, and today\u2019s first action.',
    iconId: 'target',
    examples: [
      'Break my semester project into weekly milestones, risks, and the first 3 actions.',
      'Turn "improve my grades" into a concrete 30-day plan with measurable checkpoints.',
      'Help me create a portfolio goal I can finish in one month while studying.',
    ],
    intake: [
      {
        id: 'goal',
        label: 'The big goal',
        placeholder: 'e.g. Finish my semester project',
        multiline: true,
        maxLength: 300,
      },
      {
        id: 'timeframe',
        label: 'Rough deadline',
        placeholder: 'e.g. End of the month',
        maxLength: 60,
      },
    ],
  },
  {
    id: 'reflection',
    route: '/reflection',
    title: 'Quick Reflection',
    shortTitle: 'Reflection',
    headline: 'Understand your day without self-blame.',
    copy: 'Learn from today without turning it into self-blame.',
    explanation:
      'Use this when you want to understand what happened today, keep the useful lesson, and move forward lightly.',
    outcome:
      'Share what happened, what felt hard, and what you want to learn. MindPulse will help you find a calm takeaway.',
    bestFor: ['Self-awareness', 'Weekly reflection', 'Emotional clarity'],
    emptyHint:
      'Start with one honest sentence about today. MindPulse will ask better questions and help you find the useful lesson.',
    iconId: 'sparkles',
    examples: [
      'Guide me through a 5-minute weekly reflection with 3 honest questions.',
      'I did not finish my plan. Help me learn from it without turning it into guilt.',
      'Turn today\u2019s messy thoughts into one calm takeaway and one next action.',
    ],
    intake: [
      {
        id: 'happened',
        label: 'One honest sentence about today',
        placeholder: 'e.g. I planned five tasks and finished one\u2026',
        multiline: true,
        maxLength: 300,
      },
    ],
  },
];

export const toolsByMode = Object.fromEntries(
  mindPulseTools.map((tool) => [tool.id, tool]),
) as Record<ModeId, MindPulseTool>;

export const toolsByRoute = Object.fromEntries(
  mindPulseTools.map((tool) => [tool.route, tool]),
) as Record<string, MindPulseTool>;

export function isLanguageCode(value: string): value is LanguageCode {
  return languages.some((language) => language.id === value);
}
