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

export type MindPulseTool = {
  id: ModeId;
  route: string;
  title: string;
  shortTitle: string;
  copy: string;
  explanation: string;
  iconId: ToolIconId;
  examples: string[];
};

export const languages: Array<{
  id: LanguageCode;
  label: string;
  prompt: string;
}> = [
  { id: 'en', label: 'English', prompt: 'English' },
  { id: 'ru', label: 'Русский', prompt: 'Russian' },
  { id: 'kk', label: 'Қазақша', prompt: 'Kazakh' },
];

export const mindPulseTools: MindPulseTool[] = [
  {
    id: 'study',
    route: '/study',
    title: 'Study Help',
    shortTitle: 'Study',
    copy: 'Explain topics, create examples, and practice smarter.',
    explanation:
      'Use this when a topic feels blurry and you want a calm explanation, a simple example, or a few practice questions.',
    iconId: 'book',
    examples: [
      'Explain active recall in two short paragraphs.',
      'Quiz me on photosynthesis with five questions.',
      'Turn these class notes into a simple study guide.',
      'Explain this math idea like I am learning it for the first time.',
    ],
  },
  {
    id: 'planner',
    route: '/planner',
    title: 'Daily Planner',
    shortTitle: 'Planner',
    copy: 'Turn a messy day into realistic time blocks.',
    explanation:
      'Use this when your tasks are scattered and you need a plan that respects your real energy, deadlines, and breaks.',
    iconId: 'calendar',
    examples: [
      'I have three assignments tonight. Build a realistic plan.',
      'Make a two-hour study schedule with breaks.',
      'Help me prioritize homework, exam review, and rest.',
      'Plan my Sunday so I do not leave everything to midnight.',
    ],
  },
  {
    id: 'motivation',
    route: '/motivation',
    title: 'Motivation Reset',
    shortTitle: 'Motivation',
    copy: 'Find the smallest useful next step when you feel stuck.',
    explanation:
      'Use this when you are procrastinating, tired, or overwhelmed and need a gentle reset instead of pressure.',
    iconId: 'zap',
    examples: [
      'I cannot start studying. Give me the smallest first step.',
      'Help me reset after wasting the afternoon.',
      'I feel behind. Give me a calm plan for the next 20 minutes.',
      'Make this task feel less intimidating.',
    ],
  },
  {
    id: 'habit',
    route: '/habits',
    title: 'Habit Coach',
    shortTitle: 'Habits',
    copy: 'Build routines that survive busy student days.',
    explanation:
      'Use this when you want a routine that is forgiving, small enough to repeat, and not based on guilt.',
    iconId: 'repeat',
    examples: [
      'Help me build a 10-minute study habit.',
      'Design a morning routine for school days.',
      'I keep breaking habits. Make a forgiving plan.',
      'Create a tiny habit for reviewing notes after class.',
    ],
  },
  {
    id: 'goal',
    route: '/goals',
    title: 'Goal Breakdown',
    shortTitle: 'Goals',
    copy: 'Break large goals into milestones and next actions.',
    explanation:
      'Use this when a goal is too big to hold in your head and you need it split into visible, doable steps.',
    iconId: 'target',
    examples: [
      'Break my semester project into weekly milestones.',
      'Turn “improve my grades” into a concrete plan.',
      'Create next actions for applying to scholarships.',
      'Help me define a realistic goal for this month.',
    ],
  },
  {
    id: 'reflection',
    route: '/reflection',
    title: 'Quick Reflection',
    shortTitle: 'Reflection',
    copy: 'Learn from today without turning it into self-blame.',
    explanation:
      'Use this when you want to understand what happened today, keep the useful lesson, and move forward lightly.',
    iconId: 'sparkles',
    examples: [
      'Help me reflect on today in five minutes.',
      'I did not finish my plan. What can I learn without guilt?',
      'Ask me three reflection questions about my study day.',
      'Turn today’s messy notes into a calm takeaway.',
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
