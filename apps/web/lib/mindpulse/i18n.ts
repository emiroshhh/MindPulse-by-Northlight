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
  onboardingLabel: string;
  onboardingTitle: string;
  onboardingIntro: string;
  onboardingSteps: [string, string][];
  onboardingPromptTitle: string;
  onboardingPromptExamples: string[];
  commandLabel: string;
  commandTitle: string;
  commandDesc: string;
  // Today’s focus widget
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
  agentSubtitle: string;
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
  nextActionsTitle: string;
  nextActions: [string, string, string][];
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
  toolPageBestFor: string;
  toolPagePromptStarters: string;
  toolPageHowToUse: string;
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
  onboardingLabel: 'Start here',
  onboardingTitle: 'Get value in under one minute.',
  onboardingIntro:
    'MindPulse works best when you choose a tool, describe the real situation, and turn the answer into one next action.',
  onboardingSteps: [
    ['Choose a tool', 'Pick Study, Planner, Motivation, Habits, Goals, or Reflection based on what feels stuck.'],
    ['Ask clearly', 'Mention the deadline, your energy, and what kind of help you want.'],
    ['Turn it into action', 'Copy one next step into today’s focus and start small.'],
  ],
  onboardingPromptTitle: 'A strong first prompt sounds like:',
  onboardingPromptExamples: [
    'I have 90 minutes, low energy, and a math test tomorrow. Build a realistic plan.',
    'I am stuck on this topic. Explain it simply, then quiz me with five questions.',
  ],
  commandLabel: 'Command center',
  commandTitle: 'One hub for study, planning, and momentum.',
  commandDesc:
    'Set today’s focus, pick a tool, chat with MindPulse, or ask the Agent to turn a messy situation into a structured plan.',

  focusTitle: "Today’s focus",
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
  agentSubtitle:
    'Use this when you do not need a long chat — you need a clean plan, next actions, and a smallest first step.',
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
  nextActionsTitle: 'What to try next',
  nextActions: [
    ['Plan your day', 'Use Planner if your tasks are scattered.', '/planner'],
    ['Study one topic', 'Use Study when a concept feels foggy.', '/study'],
    ['Reset momentum', 'Use Motivation when starting feels heavy.', '/motivation'],
  ],

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
  toolPageBestFor: 'Best for',
  toolPagePromptStarters: 'Prompt starters',
  toolPageHowToUse: 'How to use this mode',
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
  onboardingLabel: 'Начни здесь',
  onboardingTitle: 'Получи пользу меньше чем за минуту.',
  onboardingIntro:
    'MindPulse лучше всего работает, когда ты выбираешь инструмент, описываешь реальную ситуацию и превращаешь ответ в одно следующее действие.',
  onboardingSteps: [
    ['Выбери инструмент', 'Открой Учёбу, Планировщик, Мотивацию, Привычки, Цели или Рефлексию — по тому, где ты застрял.'],
    ['Спроси конкретно', 'Укажи дедлайн, энергию и какой формат помощи нужен.'],
    ['Сделай действие', 'Перенеси один следующий шаг в фокус дня и начни с малого.'],
  ],
  onboardingPromptTitle: 'Хороший первый запрос звучит так:',
  onboardingPromptExamples: [
    'У меня 90 минут, мало энергии и завтра тест по математике. Составь реалистичный план.',
    'Я застрял на этой теме. Объясни просто, а потом проверь меня пятью вопросами.',
  ],
  commandLabel: 'Командный центр',
  commandTitle: 'Один хаб для учёбы, планов и движения вперёд.',
  commandDesc:
    'Поставь фокус на день, выбери инструмент, поговори с MindPulse или попроси Агента превратить хаос в структурированный план.',

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
  agentSubtitle:
    'Используй, когда нужен не длинный чат, а чистый план, следующие действия и самый маленький первый шаг.',
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
  nextActionsTitle: 'Что попробовать дальше',
  nextActions: [
    ['Распланировать день', 'Открой Планировщик, если задачи разбросаны.', '/planner'],
    ['Разобрать тему', 'Открой Учёбу, если тема кажется туманной.', '/study'],
    ['Вернуть импульс', 'Открой Мотивацию, если трудно начать.', '/motivation'],
  ],

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
  toolPageBestFor: 'Лучше всего для',
  toolPagePromptStarters: 'Примеры запросов',
  toolPageHowToUse: 'Как использовать этот режим',
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
  onboardingLabel: 'Осы жерден баста',
  onboardingTitle: 'Бір минутқа жетпей пайда ал.',
  onboardingIntro:
    'MindPulse жақсы жұмыс істеуі үшін құралды таңда, нақты жағдайды жаз және жауапты бір келесі әрекетке айналдыр.',
  onboardingSteps: [
    ['Құрал таңда', 'Оқу, Жоспарлаушы, Мотивация, Әдеттер, Мақсаттар немесе Рефлексияны қай жерде тұрып қалғаныңа қарай таңда.'],
    ['Нақты сұра', 'Дедлайнды, энергия деңгейін және қандай көмек керегін жаз.'],
    ['Әрекетке айналдыр', 'Бір келесі қадамды бүгінгі фокусқа жазып, кішкентайдан баста.'],
  ],
  onboardingPromptTitle: 'Жақсы бірінші prompt осылай естіледі:',
  onboardingPromptExamples: [
    'Менде 90 минут, энергиям аз және ертең математика тесті бар. Шынайы жоспар жаса.',
    'Мен осы тақырыпта тұрып қалдым. Қарапайым түсіндір, кейін бес сұрақпен тексер.',
  ],
  commandLabel: 'Командалық орталық',
  commandTitle: 'Оқу, жоспар және қозғалыс үшін бір хаб.',
  commandDesc:
    'Бүгінгі фокусты қой, құрал таңда, MindPulse-пен сөйлес немесе Агенттен шашыраңқы жағдайды құрылымды жоспарға айналдыруды сұра.',

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
  agentSubtitle:
    'Ұзақ чат емес, таза жоспар, келесі әрекеттер және ең кіші бірінші қадам керек болғанда қолдан.',
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
  nextActionsTitle: 'Келесі не көруге болады',
  nextActions: [
    ['Күніңді жоспарла', 'Тапсырмалар шашыраңқы болса, Жоспарлаушыны аш.', '/planner'],
    ['Бір тақырыпты түсін', 'Тақырып түсініксіз болса, Оқуды аш.', '/study'],
    ['Қайта қозғала баста', 'Бастау ауыр болса, Мотивацияны аш.', '/motivation'],
  ],

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
  toolPageBestFor: 'Ең пайдалысы',
  toolPagePromptStarters: 'Prompt мысалдары',
  toolPageHowToUse: 'Бұл режимді қалай қолдану керек',
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
      loading: 'MindPulse продумывает твои следующие шаги…',
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
      loading: 'MindPulse келесі қадамдарыңды ойластырып жатыр…',
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
      "You've reached today's free guest limit. Create a free account to continue with more messages and save your progress.",
    accountLimitReached:
      "You've reached today's free account limit. Come back tomorrow.",
    signup: 'Create free account',
    login: 'Log in',
    send: 'Send',
    safetyNote:
      'MindPulse gives practical support, not perfect answers. Always double-check important information.',
    fallbackError: 'MindPulse could not answer right now. Please try again.',
    loading: 'MindPulse is thinking through your next steps…',
    authChecking: 'Checking your session…',
  };
}

// ─────────────────────────────────────────────────────────────
// Tool metadata translations
// ─────────────────────────────────────────────────────────────

type LocalizedToolText = Pick<
  MindPulseTool,
  | 'title'
  | 'shortTitle'
  | 'headline'
  | 'copy'
  | 'explanation'
  | 'outcome'
  | 'bestFor'
  | 'emptyHint'
  | 'examples'
>;

const TOOL_TRANSLATIONS: Partial<
  Record<LanguageCode, Record<string, LocalizedToolText>>
> = {
  ru: {
    study: {
      title: 'Помощь в учёбе',
      shortTitle: 'Учёба',
      headline: 'Понимай быстрее, запоминай дольше.',
      copy: 'Объясняй темы, создавай примеры и занимайся умнее.',
      explanation:
        'Используй это, когда тема кажется туманной и хочешь спокойного объяснения, простого примера или нескольких практических вопросов.',
      outcome:
        'Лучше всего работает, когда ты указываешь предмет, дедлайн и что именно непонятно.',
      bestFor: ['Подготовка к экзамену', 'Сложные темы', 'Учебные планы'],
      emptyHint:
        'Начни с темы, своего уровня и того, что нужно дальше: объяснение, тест, конспект или план.',
      examples: [
        'У меня экзамен по биологии через 3 дня. Составь план учёбы с активным вспоминанием и практическими вопросами.',
        'Объясни квадратичные функции шаг за шагом, а потом проверь меня 5 вопросами.',
        'Преврати эти черновые заметки в одностраничный конспект с терминами и типичными ошибками.',
      ],
    },
    planner: {
      title: 'Ежедневный планировщик',
      shortTitle: 'Планировщик',
      headline: 'Преврати суматошный день в реалистичный план.',
      copy: 'Превращает суматошный день в реалистичные временны́е блоки.',
      explanation:
        'Используй это, когда задачи разбросаны и нужен план, учитывающий твою реальную энергию, дедлайны и перерывы.',
      outcome:
        'Поделись задачами, временем и обязательными делами, чтобы MindPulse расставил приоритеты без фантазии, будто ты робот.',
      bestFor: ['План на день', 'План на неделю', 'Сортировка приоритетов'],
      emptyHint:
        'Перечисли задачи, дедлайны, доступное время и уровень энергии. MindPulse превратит это в следующие действия.',
      examples: [
        'Распланируй мой день с 16:00 до 22:00: домашка, ужин и один настоящий перерыв.',
        'Отсортируй эти задачи по срочности и важности, затем скажи, что делать первым: математика, эссе, карточки, стирка.',
        'Собери недельный план подготовки к экзамену без выгорания.',
      ],
    },
    motivation: {
      title: 'Перезагрузка мотивации',
      shortTitle: 'Мотивация',
      headline: 'Сдвинься с места без крика на себя.',
      copy: 'Найди наименьший полезный следующий шаг, когда застрял.',
      explanation:
        'Используй это, когда откладываешь, устал или перегружен и нужна мягкая перезагрузка, а не давление.',
      outcome:
        'Расскажи, чего избегаешь и сколько энергии осталось. MindPulse поможет вернуться через один маленький шаг.',
      bestFor: ['Когда застрял', 'Возврат уверенности', 'Дисциплина без вины'],
      emptyHint:
        'Опиши, что откладываешь и почему это кажется тяжёлым. MindPulse найдёт самый маленький полезный шаг.',
      examples: [
        'Я потерял весь день и чувствую, что отстаю. Дай спокойный план перезапуска на 20 минут.',
        'Я не могу начать эссе, потому что оно слишком большое. Сделай первый шаг крошечным и конкретным.',
        'Помоги восстановить уверенность после плохой контрольной без фразы "всё нормально".',
      ],
    },
    habit: {
      title: 'Коуч по привычкам',
      shortTitle: 'Привычки',
      headline: 'Строй привычки, которые выдерживают реальную жизнь.',
      copy: 'Создавай распорядки, которые выдерживают загруженные студенческие дни.',
      explanation:
        'Используй это, когда хочешь распорядок, который прощает, достаточно мал для повторения и не основан на чувстве вины.',
      outcome:
        'Назови привычку, типичное препятствие и реалистичное время. MindPulse соберёт рутину, которую можно повторять.',
      bestFor: ['Новые привычки', 'Последовательность', 'Простые рутины'],
      emptyHint:
        'Назови привычку, когда она должна происходить и что обычно её ломает. MindPulse сделает её меньше и устойчивее.',
      examples: [
        'Помоги выработать 10-минутную привычку к учёбе, которая работает даже в загруженные дни.',
        'Сделай утреннюю рутину для учебных дней, которая не развалится, если я проснусь поздно.',
        'Я бросаю привычки через 3 дня. Составь мягкий план перезапуска с запасной версией.',
      ],
    },
    goal: {
      title: 'Разбивка цели',
      shortTitle: 'Цели',
      headline: 'Сделай большую цель достаточно маленькой, чтобы начать.',
      copy: 'Разбивай большие цели на этапы и следующие действия.',
      explanation:
        'Используй это, когда цель слишком большая, чтобы удержать в голове, и нужно разбить её на видимые, выполнимые шаги.',
      outcome:
        'Поделись целью, зачем она важна и когда нужен прогресс. MindPulse превратит её в этапы и действия.',
      bestFor: ['Большие цели', 'Портфолио', 'Учёба и карьера'],
      emptyHint:
        'Напиши большую цель и примерный дедлайн. MindPulse разобьёт её на этапы, недельные шаги и первое действие на сегодня.',
      examples: [
        'Разбей мой семестровый проект на недельные этапы, риски и первые 3 действия.',
        'Преврати «улучшить оценки» в конкретный 30-дневный план с измеримыми checkpoint-ами.',
        'Помоги создать цель для портфолио, которую реально закончить за месяц вместе с учёбой.',
      ],
    },
    reflection: {
      title: 'Быстрая рефлексия',
      shortTitle: 'Рефлексия',
      headline: 'Пойми свой день без самокритики.',
      copy: 'Учись у сегодняшнего дня без превращения его в самокритику.',
      explanation:
        'Используй это, когда хочешь понять, что произошло сегодня, сохранить полезный урок и двигаться дальше налегке.',
      outcome:
        'Расскажи, что произошло, что было трудным и чему хочешь научиться. MindPulse поможет найти спокойный вывод.',
      bestFor: ['Самопонимание', 'Недельная рефлексия', 'Эмоциональная ясность'],
      emptyHint:
        'Начни с одного честного предложения о сегодняшнем дне. MindPulse задаст лучшие вопросы и поможет найти полезный урок.',
      examples: [
        'Проведи меня через 5-минутную недельную рефлексию с 3 честными вопросами.',
        'Я не выполнил план. Помоги извлечь урок без чувства вины.',
        'Преврати сегодняшние беспорядочные мысли в один спокойный вывод и одно следующее действие.',
      ],
    },
  },

  kk: {
    study: {
      title: 'Оқу көмегі',
      shortTitle: 'Оқу',
      headline: 'Жылдамырақ түсініп, ұзақ есте сақта.',
      copy: 'Тақырыптарды түсіндіріп, мысалдар жасап, ақылды оқы.',
      explanation:
        'Тақырып бұлыңғыр болғанда, тыныш түсіндірме, қарапайым мысал немесе бірнеше жаттығу сұрақтары қажет болса қолдан.',
      outcome:
        'Пәнді, дедлайнды және нақты түсініксіз жерді жазсаң, жауап пайдалырақ болады.',
      bestFor: ['Емтиханға дайындық', 'Қиын тақырыптар', 'Оқу жоспарлары'],
      emptyHint:
        'Тақырыпты, қазіргі деңгейіңді және не керек екенін жаз: түсіндіру, тест, конспект немесе жоспар.',
      examples: [
        'Биология емтиханыма 3 күн қалды. Белсенді еске түсіру және жаттығу сұрақтарымен оқу жоспарын жаса.',
        'Квадраттық функцияларды қадам-қадаммен түсіндір, кейін 5 сұрақпен тексер.',
        'Осы шикі конспектілерді негізгі терминдер мен жиі қателер бар бір беттік оқу нұсқаулығына айналдыр.',
      ],
    },
    planner: {
      title: 'Күнделікті жоспарлаушы',
      shortTitle: 'Жоспарлаушы',
      headline: 'Шашыраңқы күнді шынайы жоспарға айналдыр.',
      copy: 'Шуылдаған күнді реалистік уақыт блоктарына айналдыр.',
      explanation:
        'Тапсырмалар шашыранды болғанда, нақты энергияны, мерзімдерді және демалыстарды ескеретін жоспар қажет болса қолдан.',
      outcome:
        'Тапсырмаларыңды, бос уақытыңды және міндетті істерді жаз. MindPulse күнді робот сияқты емес, шынайы етіп реттейді.',
      bestFor: ['Күндік жоспар', 'Апталық жоспар', 'Приоритет таңдау'],
      emptyHint:
        'Тапсырмаларды, дедлайндарды, бос уақытты және энергия деңгейін жаз. MindPulse оны келесі әрекеттерге айналдырады.',
      examples: [
        'Күнімді 16:00-ден 22:00-ге дейін жоспарла: үй жұмысы, кешкі ас және бір нақты үзіліс.',
        'Мына тапсырмаларды срочность пен маңыздылық бойынша сұрыптап, бірінші не істеу керегін айт: математика, эссе, карточкалар, кір жуу.',
        'Күйіп кетпейтіндей емтиханға дайындықтың апталық жоспарын құр.',
      ],
    },
    motivation: {
      title: 'Мотивацияны қалпына келтіру',
      shortTitle: 'Мотивация',
      headline: 'Өзіңе ұрыспай, қайта қозғала баста.',
      copy: 'Тұрып қалғанда, ең кіші пайдалы қадамды тап.',
      explanation:
        'Кейінге қалдыратын, шаршаған немесе шамадан тыс жүктелген кезде, қысымның орнына жұмсақ қалпына келтіру қажет болса қолдан.',
      outcome:
        'Неден қашып жүргеніңді және энергияң қанша екенін айт. MindPulse бір кішкентай қадаммен қайта бастауға көмектеседі.',
      bestFor: ['Тұрып қалғанда', 'Өзіңе сенімділік', 'Кінәсіз тәртіп'],
      emptyHint:
        'Не нәрсені кейінге қалдырып жүргеніңді және неге ауыр көрінетінін жаз. MindPulse ең кіші пайдалы қадамды табады.',
      examples: [
        'Күнім бос өтті, артта қалғандай сезінемін. 20 минуттық тыныш reset жоспарын бер.',
        'Эссені бастай алмаймын, себебі тым үлкен көрінеді. Бірінші қадамды өте кішкентай және нақты ет.',
        'Нашар тесттен кейін сенімділікті қайта құруға көмектес, бірақ "бәрі жақсы" деп жеңілдетпе.',
      ],
    },
    habit: {
      title: 'Әдет жаттықтырушысы',
      shortTitle: 'Әдеттер',
      headline: 'Шынайы өмірге шыдайтын әдеттер құр.',
      copy: 'Бос студенттік күндерде өмір сүретін тәртіптер қалыптастыр.',
      explanation:
        'Кешіретін, қайталауға жеткілікті кіші және кінәға негізделмеген тәртіп қажет болса қолдан.',
      outcome:
        'Әдетті, негізгі кедергіні және нақты уақыт аралығын жаз. MindPulse қайталанатын routine құрады.',
      bestFor: ['Әдет қалыптастыру', 'Тұрақтылық', 'Қарапайым routine'],
      emptyHint:
        'Әдетті, қашан жасағың келетінін және оны әдетте не бұзатынын жаз. MindPulse оны кішірейтіп, тұрақты етеді.',
      examples: [
        'Қарбалас оқу күндерінде де істелетін 10 минуттық оқу әдетін қалыптастыруға көмектес.',
        'Кеш тұрсам да құлап қалмайтын оқу күндеріне арналған таңертеңгі routine жаса.',
        'Әдеттерді 3 күннен кейін тастаймын. Жұмсақ reset жоспарын және backup нұсқасын жаса.',
      ],
    },
    goal: {
      title: 'Мақсатты бөлу',
      shortTitle: 'Мақсаттар',
      headline: 'Үлкен мақсатты бастауға болатындай кішірейт.',
      copy: 'Үлкен мақсаттарды кезеңдер мен келесі қадамдарға бөлу.',
      explanation:
        'Мақсат тым үлкен болып, оны кезеңдер мен орындалатын қадамдарға бөлу қажет болса қолдан.',
      outcome:
        'Мақсатты, неге маңызды екенін және қашан прогресс керегін жаз. MindPulse оны кезеңдер мен әрекеттерге бөледі.',
      bestFor: ['Үлкен мақсаттар', 'Портфолио мақсаттары', 'Оқу және карьера'],
      emptyHint:
        'Үлкен мақсатты және шамамен дедлайнды жаз. MindPulse оны кезеңдерге, апталық қадамдарға және бүгінгі бірінші әрекетке бөледі.',
      examples: [
        'Семестрлік жобамды апталық кезеңдерге, risk-терге және алғашқы 3 әрекетке бөл.',
        '«Бағаларды жақсарту»-ды өлшенетін checkpoints бар нақты 30 күндік жоспарға айналдыр.',
        'Оқумен қатар бір айда аяқтауға болатын portfolio мақсатын жасауға көмектес.',
      ],
    },
    reflection: {
      title: 'Жылдам рефлексия',
      shortTitle: 'Рефлексия',
      headline: 'Күніңді өзіңді кінәламай түсін.',
      copy: 'Бүгіннен үйрен, бірақ оны өзіне кінә артуға айналдырма.',
      explanation:
        'Бүгін не болғанын түсінгің келгенде, пайдалы сабақты сақтап, жеңіл алға жылжу қажет болса қолдан.',
      outcome:
        'Не болғанын, не қиын болғанын және нені түсінгің келетінін жаз. MindPulse тыныш қорытынды табуға көмектеседі.',
      bestFor: ['Өзін түсіну', 'Апталық рефлексия', 'Эмоциялық айқындық'],
      emptyHint:
        'Бүгін туралы бір шынайы сөйлемнен баста. MindPulse жақсырақ сұрақтар қойып, пайдалы сабақ табуға көмектеседі.',
      examples: [
        'Мені 3 шынайы сұрақпен 5 минуттық апталық рефлексиядан өткіз.',
        'Жоспарымды орындамадым. Кінәсіз сабақ алуға көмектес.',
        'Бүгінгі ретсіз ойларды бір тыныш қорытындыға және бір келесі әрекетке айналдыр.',
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
