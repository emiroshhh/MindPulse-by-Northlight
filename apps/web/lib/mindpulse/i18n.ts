// MindPulse UI localization — Phase 3.1
// Single source of truth for all UI strings across en / ru / kk.
// Pure module: no React, no side-effects, safe to import from server or client.

import { mindPulseTools, type LanguageCode, type MindPulseTool } from './tools';

// ─────────────────────────────────────────────────────────────
// UI copy shape
// ─────────────────────────────────────────────────────────────

export type UiCopy = {
  // Navigation
  navDashboard: string;
  navWhy: string;
  navAgent: string;
  navLogin: string;
  navLogout: string;
  navSignup: string;
  // Guest banner
  guestBannerText: string;
  guestBannerCreate: string;
  guestBannerLogin: string;
  guestBannerContinue: string;
  // Hero
  heroBeta: string;
  heroBuiltBy: string;
  heroTitle: string;
  heroSubtitle: string;
  heroOpenChat: string;
  heroWhy: string;
  // Today's focus widget
  focusTitle: string;
  focusPlaceholder: string;
  focusNote: string;
  // Plan card
  planGuestLabel: string;
  planAccountLabel: string;
  planGuestDesc: string;
  planAccountDesc: string;
  // Feature cards [title, copy][]
  featureCards: [string, string][];
  // Tools section
  toolsLabel: string;
  toolsTitle: string;
  toolsDesc: string;
  toolOpenLabel: string;
  // Agent section
  agentLabel: string;
  agentTitle: string;
  agentPrompts: string[];
  agentPlaceholder: string;
  agentGenerate: string;
  agentOutputTitle: string;
  agentOutputEmpty: string;
  agentSave: string;
  agentSavedLocal: string;
  agentFallback: string;
  // Recent sessions
  recentTitle: string;
  recentGuest: string;
  recentAccount: string;
  // Footer
  footerDashboard: string;
  footerWhy: string;
  footerImpact: string;
  footerPrivacy: string;
  footerFeedback: string;
  footerNote: string;
  // Tool page labels
  toolPageBack: string;
  toolPageBeta: string;
  toolPageGuestAccess: string;
  toolPageAccountAccess: string;
  toolPageGuestSlogan: string;
  toolPageAccountSlogan: string;
  toolPageGuestDesc: string;
  toolPageAccountDesc: string;
  toolPageCreate: string;
  toolPageLogin: string;
  // Auth state
  authChecking: string;
  agentNeedLogin: string;
};

// ─────────────────────────────────────────────────────────────
// English
// ─────────────────────────────────────────────────────────────

const EN: UiCopy = {
  navDashboard: 'Dashboard',
  navWhy: 'Why I built this',
  navAgent: 'Agent',
  navLogin: 'Log in',
  navLogout: 'Logout',
  navSignup: 'Sign up',

  guestBannerText:
    'Create a free account to continue with more messages and save your progress. Guest history stays local to this device.',
  guestBannerCreate: 'Create free account',
  guestBannerLogin: 'Log in',
  guestBannerContinue: 'Continue as guest',

  heroBeta: 'Beta',
  heroBuiltBy: 'Built by a student, for students',
  heroTitle: 'A calmer student workspace for messy days.',
  heroSubtitle:
    'MindPulse helps you study, plan, reset motivation, build habits, break down goals, and reflect without guilt. Start as a guest, or create a free account when you want saved progress.',
  heroOpenChat: 'Open AI chat',
  heroWhy: 'Why I built this',

  focusTitle: "Today's focus",
  focusPlaceholder: 'One useful thing for today…',
  focusNote:
    'No shame streaks. Pick one useful thing today and let the rest become easier after that.',

  planGuestLabel: 'Guest plan',
  planAccountLabel: 'Account plan',
  planGuestDesc: '5 free guest messages/day · local history only',
  planAccountDesc: '20 free messages/day · D1 chat history enabled',

  featureCards: [
    ['Free student beta', 'No payments, subscriptions, or ads.'],
    ['Guest-first', 'Try MindPulse without a login wall.'],
    ['Private by design', 'API keys and account data stay server-side.'],
  ],

  toolsLabel: 'Six tools',
  toolsTitle: 'Choose what kind of support you need.',
  toolsDesc:
    'Each tool opens a focused chat mode with examples, while preserving the same guest/account limits and language setting.',
  toolOpenLabel: 'Open tool →',

  agentLabel: 'AI Agent',
  agentTitle: 'Turn vague pressure into a plan.',
  agentPrompts: [
    'Turn my exam panic into a 3-day study plan',
    'Break my semester project into next actions',
    'I keep procrastinating. Give me the smallest first step',
  ],
  agentPlaceholder: 'I have a biology exam Friday and I am behind…',
  agentGenerate: 'Generate next step',
  agentOutputTitle: 'Structured output',
  agentOutputEmpty:
    'Your Agent result will show Goal, Plan, Next 3 actions, Deadline, Motivation reset, Obstacles, and Smallest first step.',
  agentSave: 'Save plan',
  agentSavedLocal: 'Saved locally on this device.',
  agentFallback: 'MindPulse Agent could not generate a plan right now.',

  recentTitle: 'Recent sessions',
  recentGuest:
    'Guest conversations stay in this browser. Open the chat above to continue your local session.',
  recentAccount:
    'Your latest account conversations load inside the chat panel and are saved to D1.',

  footerDashboard: 'Dashboard',
  footerWhy: 'Why I built this',
  footerImpact: 'Impact',
  footerPrivacy: 'Privacy',
  footerFeedback: 'Feedback',
  footerNote:
    'MindPulse is not therapy or emergency help. AI can make mistakes. Always verify important information.',

  toolPageBack: 'Back to dashboard',
  toolPageBeta: 'Free student beta',
  toolPageGuestAccess: 'Guest access',
  toolPageAccountAccess: 'Account access',
  toolPageGuestSlogan: 'Try it without login.',
  toolPageAccountSlogan: 'Synced to your account.',
  toolPageGuestDesc: 'Guest chat stays local and has 5 free AI messages per day.',
  toolPageAccountDesc:
    'Your account has 20 free AI messages per day and saves chat history in D1.',
  toolPageCreate: 'Create account',
  toolPageLogin: 'Log in',
  authChecking: 'Checking your session…',
  agentNeedLogin: 'Sign in to save your plan to your account.',
};

// ─────────────────────────────────────────────────────────────
// Russian
// ─────────────────────────────────────────────────────────────

const RU: UiCopy = {
  navDashboard: 'Главная',
  navWhy: 'Почему я создал это',
  navAgent: 'Агент',
  navLogin: 'Войти',
  navLogout: 'Выйти',
  navSignup: 'Зарегистрироваться',

  guestBannerText:
    'Создай аккаунт, чтобы продолжить с большим количеством сообщений и сохранить прогресс. История гостя хранится только в этом браузере.',
  guestBannerCreate: 'Создать аккаунт',
  guestBannerLogin: 'Войти',
  guestBannerContinue: 'Продолжить как гость',

  heroBeta: 'Бета',
  heroBuiltBy: 'Создано студентом для студентов',
  heroTitle: 'Спокойное рабочее пространство для суматошных дней.',
  heroSubtitle:
    'MindPulse помогает учиться, планировать, восстанавливать мотивацию, строить привычки, разбивать цели и рефлексировать без чувства вины. Начни как гость или создай аккаунт, когда захочешь сохранять прогресс.',
  heroOpenChat: 'Открыть чат',
  heroWhy: 'Почему я создал это',

  focusTitle: 'Фокус на сегодня',
  focusPlaceholder: 'Одно полезное дело на сегодня…',
  focusNote:
    'Без чувства вины. Выбери одно полезное дело сегодня и всё остальное станет легче после этого.',

  planGuestLabel: 'Гостевой план',
  planAccountLabel: 'Аккаунт',
  planGuestDesc: '5 сообщений в день · история только локально',
  planAccountDesc: '20 сообщений в день · история сохраняется в D1',

  featureCards: [
    ['Бесплатная студенческая бета', 'Без платежей, подписок и рекламы.'],
    ['Гости в приоритете', 'Попробуй MindPulse без регистрации.'],
    ['Приватность по умолчанию', 'API-ключи и данные хранятся на сервере.'],
  ],

  toolsLabel: 'Шесть инструментов',
  toolsTitle: 'Выбери, какая поддержка тебе нужна.',
  toolsDesc:
    'Каждый инструмент открывает сфокусированный режим чата с примерами, сохраняя те же лимиты и языковые настройки.',
  toolOpenLabel: 'Открыть →',

  agentLabel: 'ИИ Агент',
  agentTitle: 'Преврати расплывчатое давление в план.',
  agentPrompts: [
    'Преврати мой страх перед экзаменом в 3-дневный план учёбы',
    'Разбей мой семестровый проект на следующие действия',
    'Я постоянно откладываю. Дай мне самый маленький первый шаг',
  ],
  agentPlaceholder: 'У меня в пятницу экзамен по биологии, и я отстаю…',
  agentGenerate: 'Сгенерировать план',
  agentOutputTitle: 'Структурированный результат',
  agentOutputEmpty:
    'Здесь появится результат Агента: Цель, План, 3 следующих действия, Дедлайн, Перезагрузка мотивации, Препятствия и Первый шаг.',
  agentSave: 'Сохранить план',
  agentSavedLocal: 'Сохранено локально на этом устройстве.',
  agentFallback: 'MindPulse Агент не смог сгенерировать план прямо сейчас.',

  recentTitle: 'Последние сессии',
  recentGuest:
    'Гостевые разговоры сохраняются в этом браузере. Откройте чат выше, чтобы продолжить локальную сессию.',
  recentAccount:
    'Последние разговоры загружаются в панели чата и сохраняются в D1.',

  footerDashboard: 'Главная',
  footerWhy: 'Почему я создал это',
  footerImpact: 'Результаты',
  footerPrivacy: 'Конфиденциальность',
  footerFeedback: 'Обратная связь',
  footerNote:
    'MindPulse не является терапией или экстренной помощью. ИИ может ошибаться. Проверяйте важную информацию.',

  toolPageBack: 'Назад на главную',
  toolPageBeta: 'Бесплатная студенческая бета',
  toolPageGuestAccess: 'Гостевой доступ',
  toolPageAccountAccess: 'Доступ к аккаунту',
  toolPageGuestSlogan: 'Попробуй без регистрации.',
  toolPageAccountSlogan: 'Синхронизировано с аккаунтом.',
  toolPageGuestDesc: 'Гостевой чат сохраняется локально. 5 бесплатных AI-сообщений в день.',
  toolPageAccountDesc:
    '20 бесплатных AI-сообщений в день. История чата сохраняется в D1.',
  toolPageCreate: 'Создать аккаунт',
  toolPageLogin: 'Войти',
  authChecking: 'Проверяем сессию…',
  agentNeedLogin: 'Войдите, чтобы сохранить план в аккаунте.',
};

// ─────────────────────────────────────────────────────────────
// Kazakh
// ─────────────────────────────────────────────────────────────

const KK: UiCopy = {
  navDashboard: 'Басты бет',
  navWhy: 'Неге жасадым',
  navAgent: 'Агент',
  navLogin: 'Кіру',
  navLogout: 'Шығу',
  navSignup: 'Тіркелу',

  guestBannerText:
    'Көбірек хабарлама жіберіп, прогресіңді сақтау үшін аккаунт ашыңыз. Қонақ тарихы тек осы браузерде сақталады.',
  guestBannerCreate: 'Тегін тіркелу',
  guestBannerLogin: 'Кіру',
  guestBannerContinue: 'Қонақ ретінде жалғастыру',

  heroBeta: 'Бета',
  heroBuiltBy: 'Студент үшін студент жасаған',
  heroTitle: 'Шуылдаған күндер үшін тыныш студент кеңістігі.',
  heroSubtitle:
    'MindPulse оқуға, жоспарлауға, мотивацияны қалпына келтіруге, әдеттер қалыптастыруға, мақсаттарды бөлуге және кінәсіз рефлексияға көмектеседі. Қонақ ретінде бастаңыз немесе прогресті сақтағыңыз келсе аккаунт ашыңыз.',
  heroOpenChat: 'AI чатын ашу',
  heroWhy: 'Неге жасадым',

  focusTitle: 'Бүгінгі фокус',
  focusPlaceholder: 'Бүгін бір пайдалы іс…',
  focusNote:
    'Кінәсіз. Бүгін бір пайдалы іс таңдаңыз, қалғанының бәрі одан кейін оңайырақ болады.',

  planGuestLabel: 'Қонақ жоспары',
  planAccountLabel: 'Аккаунт жоспары',
  planGuestDesc: 'Күніне 5 хабарлама · тек жергілікті тарих',
  planAccountDesc: 'Күніне 20 хабарлама · D1 тарихы қосылған',

  featureCards: [
    ['Тегін студенттік бета', 'Төлемдер, жазылымдар мен жарнамасыз.'],
    ['Қонақтар алдымен', 'Тіркелместен MindPulse-ті сынаңыз.'],
    ['Деректер қорғалған', 'API кілттері мен аккаунт деректері серверде сақталады.'],
  ],

  toolsLabel: 'Алты құрал',
  toolsTitle: 'Қандай қолдау қажетін таңдаңыз.',
  toolsDesc:
    'Әр құрал мысалдары бар сфокусталған чат режимін ашады, сонымен бірге қонақ/аккаунт лимиттері мен тіл параметрлерін сақтайды.',
  toolOpenLabel: 'Құралды ашу →',

  agentLabel: 'AI Агент',
  agentTitle: 'Бұлыңғыр қысымды жоспарға айналдырыңыз.',
  agentPrompts: [
    'Емтихан дүрбелеңімді 3 күндік оқу жоспарына айналдыр',
    'Семестрлік жобамды келесі қадамдарға бөл',
    'Мен үнемі кейінге қалдырамын. Маған ең кіші бірінші қадамды бер',
  ],
  agentPlaceholder: 'Жұма күні биология емтиханым бар, мен артта қалдым…',
  agentGenerate: 'Жоспар жасау',
  agentOutputTitle: 'Құрылымдық нәтиже',
  agentOutputEmpty:
    'Агент нәтижесі мыналарды көрсетеді: Мақсат, Жоспар, Келесі 3 қадам, Мерзім, Мотивацияны қалпына келтіру, Кедергілер және Бірінші қадам.',
  agentSave: 'Жоспарды сақтау',
  agentSavedLocal: 'Осы құрылғыда жергілікті сақталды.',
  agentFallback: 'MindPulse Агенті қазір жоспар жасай алмады.',

  recentTitle: 'Соңғы сессиялар',
  recentGuest:
    'Қонақ сөйлесулері осы браузерде сақталады. Жергілікті сессияны жалғастыру үшін жоғарыдағы чатты ашыңыз.',
  recentAccount:
    'Ең соңғы сөйлесулеріңіз чат панелінде жүктеледі және D1-де сақталады.',

  footerDashboard: 'Басты бет',
  footerWhy: 'Неге жасадым',
  footerImpact: 'Нәтиже',
  footerPrivacy: 'Құпиялылық',
  footerFeedback: 'Пікір',
  footerNote:
    'MindPulse терапия немесе шұғыл көмек емес. AI қателесуі мүмкін. Маңызды ақпаратты тексеріңіз.',

  toolPageBack: 'Басты бетке оралу',
  toolPageBeta: 'Тегін студенттік бета',
  toolPageGuestAccess: 'Қонақ қолжетімділігі',
  toolPageAccountAccess: 'Аккаунт қолжетімділігі',
  toolPageGuestSlogan: 'Кірусіз байқап көр.',
  toolPageAccountSlogan: 'Аккаунтыңызбен синхронизацияланған.',
  toolPageGuestDesc:
    'Қонақ чат жергілікті сақталады. Күніне 5 тегін AI хабарламасы.',
  toolPageAccountDesc:
    'Аккаунтыңызда күніне 20 тегін AI хабарламасы бар. Чат тарихы D1-де сақталады.',
  toolPageCreate: 'Аккаунт ашу',
  toolPageLogin: 'Кіру',
  authChecking: 'Сессия тексерілуде…',
  agentNeedLogin: 'Жоспарды аккаунтта сақтау үшін кіріңіз.',
};

// ─────────────────────────────────────────────────────────────
// UI copy resolver
// ─────────────────────────────────────────────────────────────

/** Return the full UI copy object for the given language (defaults to English). */
export function copyFor(language: string): UiCopy {
  if (language === 'ru') return RU;
  if (language === 'kk') return KK;
  return EN;
}

// ─────────────────────────────────────────────────────────────
// ChatPanel copy
// ─────────────────────────────────────────────────────────────

/** Return translated ChatPanel copy for the given language (defaults to English). */
export function chatCopyFor(language: string) {
  if (language === 'ru') {
    return {
      chooseMode: 'Выбери режим',
      emptyGuest:
        'Твой гостевой разговор появится здесь и сохранится в этом браузере.',
      emptyAuth: 'Здесь появится история твоих сохранённых разговоров.',
      guestLimitLabel: '5 бесплатных гостевых сообщений в день',
      accountLimitLabel: '20 бесплатных сообщений в день',
      guestLimitReached:
        'Ты достиг дневного лимита для гостей. Создай аккаунт, чтобы продолжить и сохранить прогресс.',
      accountLimitReached:
        'Ты достиг дневного лимита аккаунта. Возвращайся завтра.',
      signup: 'Создать аккаунт',
      login: 'Войти',
      send: 'Отправить',
      safetyNote:
        'MindPulse даёт практическую поддержку, но не идеальные ответы. Проверяйте важную информацию.',
      fallbackError:
        'MindPulse сейчас не смог ответить. Попробуй ещё раз.',
      authChecking: 'Проверяем сессию…',
    };
  }
  if (language === 'kk') {
    return {
      chooseMode: 'Режимді таңдаңыз',
      emptyGuest:
        'Қонақ сөйлесуіңіз мұнда пайда болады және осы браузерде сақталады.',
      emptyAuth: 'Сақталған сөйлесу тарихыңыз мұнда пайда болады.',
      guestLimitLabel: 'Күніне 5 тегін қонақ хабарламасы',
      accountLimitLabel: 'Күніне 20 тегін хабарлама',
      guestLimitReached:
        'Бүгінгі қонақ лимитіне жеттіңіз. Жалғастыру және прогресті сақтау үшін аккаунт ашыңыз.',
      accountLimitReached:
        'Бүгінгі аккаунт лимитіне жеттіңіз. Ертең қайтыңыз.',
      signup: 'Тегін тіркелу',
      login: 'Кіру',
      send: 'Жіберу',
      safetyNote:
        'MindPulse практикалық қолдау береді, кемел жауаптар емес. Маңызды ақпаратты тексеріңіз.',
      fallbackError: 'MindPulse қазір жауап бере алмады. Қайта байқап көр.',
      authChecking: 'Сессия тексерілуде…',
    };
  }
  // English (default)
  return {
    chooseMode: 'Choose a mode',
    emptyGuest:
      'Your guest conversation will appear here and stay in this browser.',
    emptyAuth: 'Your saved conversation history will appear here.',
    guestLimitLabel: '5 free guest messages/day',
    accountLimitLabel: '20 free messages/day',
    guestLimitReached:
      "You’ve reached today’s free guest limit. Create a free account to continue with more messages and save your progress.",
    accountLimitReached:
      "You’ve reached today’s free account limit. Come back tomorrow.",
    signup: 'Create free account',
    login: 'Log in',
    send: 'Send',
    safetyNote:
      'MindPulse gives practical support, not perfect answers. Always double-check important information.',
    fallbackError: 'MindPulse could not answer right now. Please try again.',
    authChecking: 'Checking your session…',
  };
}

// ─────────────────────────────────────────────────────────────
// Tool metadata translations
// ─────────────────────────────────────────────────────────────

type LocalizedToolText = Pick<
  MindPulseTool,
  'title' | 'shortTitle' | 'copy' | 'explanation' | 'examples'
>;

const TOOL_TRANSLATIONS: Partial<
  Record<LanguageCode, Record<string, LocalizedToolText>>
> = {
  ru: {
    study: {
      title: 'Помощь в учёбе',
      shortTitle: 'Учёба',
      copy: 'Объясняй темы, создавай примеры и занимайся умнее.',
      explanation:
        'Используй это, когда тема кажется туманной и хочешь спокойного объяснения, простого примера или нескольких практических вопросов.',
      examples: [
        'Объясни активное вспоминание в двух коротких абзацах.',
        'Проверь меня по фотосинтезу пятью вопросами.',
        'Преврати эти заметки с занятий в простой конспект.',
        'Объясни эту математическую идею так, будто я учу её впервые.',
      ],
    },
    planner: {
      title: 'Ежедневный планировщик',
      shortTitle: 'Планировщик',
      copy: 'Превращает суматошный день в реалистичные временны́е блоки.',
      explanation:
        'Используй это, когда задачи разбросаны и нужен план, учитывающий твою реальную энергию, дедлайны и перерывы.',
      examples: [
        'У меня три задания на вечер. Составь реалистичный план.',
        'Составь расписание занятий на два часа с перерывами.',
        'Помоги расставить приоритеты между домашней работой, подготовкой к экзамену и отдыхом.',
        'Распланируй воскресенье, чтобы я не оставил всё на полночь.',
      ],
    },
    motivation: {
      title: 'Перезагрузка мотивации',
      shortTitle: 'Мотивация',
      copy: 'Найди наименьший полезный следующий шаг, когда застрял.',
      explanation:
        'Используй это, когда откладываешь, устал или перегружен и нужна мягкая перезагрузка, а не давление.',
      examples: [
        'Я не могу начать учиться. Дай мне самый маленький первый шаг.',
        'Помоги перезагрузиться после потерянного вечера.',
        'Я отстаю. Дай спокойный план на следующие 20 минут.',
        'Сделай эту задачу менее пугающей.',
      ],
    },
    habit: {
      title: 'Коуч по привычкам',
      shortTitle: 'Привычки',
      copy: 'Создавай распорядки, которые выдерживают загруженные студенческие дни.',
      explanation:
        'Используй это, когда хочешь распорядок, который прощает, достаточно мал для повторения и не основан на чувстве вины.',
      examples: [
        'Помоги мне выработать 10-минутную привычку к учёбе.',
        'Создай утреннюю рутину для учебных дней.',
        'Я постоянно бросаю привычки. Составь прощающий план.',
        'Создай маленькую привычку для повторения конспектов после занятий.',
      ],
    },
    goal: {
      title: 'Разбивка цели',
      shortTitle: 'Цели',
      copy: 'Разбивай большие цели на этапы и следующие действия.',
      explanation:
        'Используй это, когда цель слишком большая, чтобы удержать в голове, и нужно разбить её на видимые, выполнимые шаги.',
      examples: [
        'Разбей мой семестровый проект на еженедельные этапы.',
        'Преврати «улучшить оценки» в конкретный план.',
        'Создай следующие шаги для подачи заявок на стипендию.',
        'Помоги определить реалистичную цель на этот месяц.',
      ],
    },
    reflection: {
      title: 'Быстрая рефлексия',
      shortTitle: 'Рефлексия',
      copy: 'Учись у сегодняшнего дня без превращения его в самокритику.',
      explanation:
        'Используй это, когда хочешь понять, что произошло сегодня, сохранить полезный урок и двигаться дальше налегке.',
      examples: [
        'Помоги мне поразмышлять о сегодняшнем дне за пять минут.',
        'Я не выполнил план. Что я могу извлечь без чувства вины?',
        'Задай мне три вопроса для рефлексии об учебном дне.',
        'Преврати беспорядочные заметки сегодняшнего дня в спокойный вывод.',
      ],
    },
  },

  kk: {
    study: {
      title: 'Оқу көмегі',
      shortTitle: 'Оқу',
      copy: 'Тақырыптарды түсіндіріп, мысалдар жасап, ақылды оқы.',
      explanation:
        'Тақырып бұлыңғыр болғанда, тыныш түсіндірме, қарапайым мысал немесе бірнеше жаттығу сұрақтары қажет болса қолдан.',
      examples: [
        'Белсенді еске түсіруді екі қысқа абзацта түсіндір.',
        'Фотосинтез бойынша бес сұрақпен тексер.',
        'Осы конспектілерді қарапайым оқу нұсқаулығына айналдыр.',
        'Бұл математикалық идеяны бірінші рет үйренгендей түсіндір.',
      ],
    },
    planner: {
      title: 'Күнделікті жоспарлаушы',
      shortTitle: 'Жоспарлаушы',
      copy: 'Шуылдаған күнді реалистік уақыт блоктарына айналдыр.',
      explanation:
        'Тапсырмалар шашыранды болғанда, нақты энергияны, мерзімдерді және демалыстарды ескеретін жоспар қажет болса қолдан.',
      examples: [
        'Бүгін үш тапсырмам бар. Реалистік жоспар жаса.',
        'Демалыстармен 2 сағаттық оқу кестесін жаса.',
        'Үй тапсырмасы, емтиханға дайындық және демалыс арасында приоритет қой.',
        'Барлығын түнгезге қалдырмайтындай жексенбіні жоспарла.',
      ],
    },
    motivation: {
      title: 'Мотивацияны қалпына келтіру',
      shortTitle: 'Мотивация',
      copy: 'Тұрып қалғанда, ең кіші пайдалы қадамды тап.',
      explanation:
        'Кейінге қалдыратын, шаршаған немесе шамадан тыс жүктелген кезде, қысымның орнына жұмсақ қалпына келтіру қажет болса қолдан.',
      examples: [
        'Оқуды бастай алмаймын. Маған ең кіші бірінші қадамды бер.',
        'Бос кешкі демалыстан кейін қалпына келуге көмекте.',
        'Артта қалдым. Келесі 20 минутқа тыныш жоспар бер.',
        'Бұл тапсырманы азырақ қорқынышты ет.',
      ],
    },
    habit: {
      title: 'Әдет жаттықтырушысы',
      shortTitle: 'Әдеттер',
      copy: 'Бос студенттік күндерде өмір сүретін тәртіптер қалыптастыр.',
      explanation:
        'Кешіретін, қайталауға жеткілікті кіші және кінәға негізделмеген тәртіп қажет болса қолдан.',
      examples: [
        'Маған 10 минуттық оқу әдетін қалыптастыруға көмекте.',
        'Оқу күндері үшін таңертеңгі тәртіп жаса.',
        'Мен үнемі әдеттерді тастаймын. Кешіретін жоспар жаса.',
        'Сабақтан кейін конспектілерді қайталауға кіші әдет жаса.',
      ],
    },
    goal: {
      title: 'Мақсатты бөлу',
      shortTitle: 'Мақсаттар',
      copy: 'Үлкен мақсаттарды кезеңдер мен келесі қадамдарға бөлу.',
      explanation:
        'Мақсат тым үлкен болып, оны кезеңдер мен орындалатын қадамдарға бөлу қажет болса қолдан.',
      examples: [
        'Семестрлік жобамды апталық кезеңдерге бөл.',
        '«Бағаларды жақсарту»-ды нақты жоспарға айналдыр.',
        'Стипендияға өтініш беруге арналған келесі қадамдар жаса.',
        'Осы айға реалистік мақсат анықтауға көмекте.',
      ],
    },
    reflection: {
      title: 'Жылдам рефлексия',
      shortTitle: 'Рефлексия',
      copy: 'Бүгіннен үйрен, бірақ оны өзіне кінә артуға айналдырма.',
      explanation:
        'Бүгін не болғанын түсінгің келгенде, пайдалы сабақты сақтап, жеңіл алға жылжу қажет болса қолдан.',
      examples: [
        'Бүгінгі күн туралы бес минутта ой толғауыма көмекте.',
        'Жоспарымды орындамадым. Кінәсіз не үйрене аламын?',
        'Оқу күнім туралы үш рефлексия сұрағын қой.',
        'Бүгінгі ретсіз конспектілерді тыныш қорытындыға айналдыр.',
      ],
    },
  },
};

/**
 * Return MindPulse tools with display text (title, copy, explanation, examples)
 * replaced by the translation for the given language.
 * The structural fields (id, route, iconId, shortTitle) are always preserved.
 * Falls back to the English source tools for any unknown language.
 */
export function getToolsForLanguage(language: string): MindPulseTool[] {
  const translations =
    TOOL_TRANSLATIONS[language as LanguageCode] ?? null;
  if (!translations) return mindPulseTools;
  return mindPulseTools.map((tool) => {
    const t = translations[tool.id];
    return t ? { ...tool, ...t } : tool;
  });
}
