import type { LanguageCode } from './tools';

/**
 * Localized copy for the public landing page. Typed so every language must
 * provide every key (compile-time completeness), mirroring UiCopy.
 * The landing renders English on the server and switches to the stored
 * language after hydration.
 */
export type LandingCopy = {
  navFeatures: string;
  navHow: string;
  navBeta: string;
  navLogin: string;
  navTry: string;
  badge: string;
  heroTitleLead: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  ctaPrimary: string;
  ctaLogin: string;
  guestNote: string;
  exampleLabel: string;
  exampleInput: string;
  exampleOutput: string;
  exampleHighlights: [string, string];
  howLabel: string;
  howSteps: Array<[string, string]>;
  featuresLabel: string;
  featuresTitle: string;
  featureNames: string[];
  whyLabel: string;
  whyTitle: string;
  whyItems: string[];
  privacyTitle: string;
  privacyCopy: string;
  privacySignup: string;
  privacyLogin: string;
  betaLabel: string;
  betaTitle: string;
  betaCopy: string;
  betaCta: string;
  betaFeedback: string;
};

const EN: LandingCopy = {
  navFeatures: 'Features',
  navHow: 'How it works',
  navBeta: 'Beta testing',
  navLogin: 'Login',
  navTry: 'Try it free',
  badge: 'Student beta — free while in testing',
  heroTitleLead: 'Overwhelmed by school?',
  heroTitleAccent: 'Start with one small step.',
  heroSubtitle:
    'MindPulse is an AI workspace for students. Describe one real task, deadline, or stuck point, and it suggests the smallest useful next action — then helps you plan, restart after missed days, and reflect without guilt.',
  ctaPrimary: 'Try it now — no login needed',
  ctaLogin: 'Log in',
  guestNote:
    'Guests get 5 free AI messages a day on this device. A free account saves your history and raises the limit to 20.',
  exampleLabel: 'Example of what you get',
  exampleInput: '“Essay due Friday and I haven’t started”',
  exampleOutput:
    'Set a 10-minute timer and write three rough bullet points of what the essay should argue. Stopping after 10 minutes is allowed.',
  exampleHighlights: [
    'One next action, not a wall of advice',
    'Recovery Mode for missed days',
  ],
  howLabel: 'How it works',
  howSteps: [
    [
      'Pick what you need',
      'Study help, planning, motivation, habits, goals, reflection — or Recovery Mode after missed days.',
    ],
    [
      'Describe one real task',
      'One sentence is enough. No questionnaire, no login required.',
    ],
    [
      'Get one small next action',
      'A concrete step you can start in the next 15 minutes — with a free account if you want history saved.',
    ],
  ],
  featuresLabel: 'Features',
  featuresTitle: 'Everything a student needs to get unstuck.',
  featureNames: [
    'AI Study Help',
    'Daily Planner',
    'Motivation Reset',
    'Habit Coach',
    'Goal Breakdown',
    'Quick Reflection',
    'Recovery Mode',
    'AI Chat + Agent',
  ],
  whyLabel: 'Why students use it',
  whyTitle: 'Relief first. Progress second.',
  whyItems: [
    'Helps with procrastination',
    'Makes studying feel less overwhelming',
    'Turns messy thoughts into clear next steps',
    'Keeps progress organized',
  ],
  privacyTitle: 'Private accounts, saved progress.',
  privacyCopy:
    'Your chat history and Agent plans are connected to your login, not public browser state. Passwords are stored only as secure salted hashes, never as plain text.',
  privacySignup: 'Create your free account',
  privacyLogin: 'Log in',
  betaLabel: 'Student beta',
  betaTitle: 'Try one tool on one real task.',
  betaCopy:
    'Use MindPulse for something you actually need today, then tell us what helped or felt unclear. No fake impact claims — just a student-focused project improving through honest feedback.',
  betaCta: 'How to beta test',
  betaFeedback: 'Share beta feedback',
};

const RU: LandingCopy = {
  navFeatures: 'Возможности',
  navHow: 'Как это работает',
  navBeta: 'Бета-тест',
  navLogin: 'Войти',
  navTry: 'Попробовать бесплатно',
  badge: 'Студенческая бета — бесплатно на время тестирования',
  heroTitleLead: 'Перегружен(а) учёбой?',
  heroTitleAccent: 'Начни с одного маленького шага.',
  heroSubtitle:
    'MindPulse — это AI-пространство для студентов. Опиши одну реальную задачу, дедлайн или затык — и получи самый маленький полезный следующий шаг. Затем — планирование, перезапуск после пропущенных дней и рефлексия без чувства вины.',
  ctaPrimary: 'Попробовать сейчас — без входа',
  ctaLogin: 'Войти',
  guestNote:
    'Гости получают 5 бесплатных AI-сообщений в день на этом устройстве. Бесплатный аккаунт сохраняет историю и повышает лимит до 20.',
  exampleLabel: 'Пример того, что ты получишь',
  exampleInput: '«Эссе к пятнице, а я ещё не начал(а)»',
  exampleOutput:
    'Поставь таймер на 10 минут и напиши три черновых тезиса о том, что эссе должно доказывать. Остановиться через 10 минут — можно.',
  exampleHighlights: [
    'Одно следующее действие, а не стена советов',
    'Режим восстановления после пропущенных дней',
  ],
  howLabel: 'Как это работает',
  howSteps: [
    [
      'Выбери, что нужно',
      'Учёба, планирование, мотивация, привычки, цели, рефлексия — или Режим восстановления после пропусков.',
    ],
    [
      'Опиши одну реальную задачу',
      'Достаточно одного предложения. Без анкеты и без регистрации.',
    ],
    [
      'Получи один маленький шаг',
      'Конкретное действие, которое можно начать в ближайшие 15 минут. Аккаунт нужен только чтобы сохранять историю.',
    ],
  ],
  featuresLabel: 'Возможности',
  featuresTitle: 'Всё, что нужно студенту, чтобы сдвинуться с места.',
  featureNames: [
    'Помощь в учёбе',
    'Ежедневный планировщик',
    'Перезагрузка мотивации',
    'Коуч по привычкам',
    'Разбивка цели',
    'Быстрая рефлексия',
    'Режим восстановления',
    'AI-чат + Агент',
  ],
  whyLabel: 'Почему студенты этим пользуются',
  whyTitle: 'Сначала облегчение. Потом прогресс.',
  whyItems: [
    'Помогает с прокрастинацией',
    'Учёба меньше давит',
    'Превращает сумбурные мысли в ясные шаги',
    'Держит прогресс в порядке',
  ],
  privacyTitle: 'Приватные аккаунты, сохранённый прогресс.',
  privacyCopy:
    'История чата и планы Агента привязаны к твоему логину, а не к публичному состоянию браузера. Пароли хранятся только как защищённые солёные хэши, никогда — открытым текстом.',
  privacySignup: 'Создать бесплатный аккаунт',
  privacyLogin: 'Войти',
  betaLabel: 'Студенческая бета',
  betaTitle: 'Попробуй один инструмент на одной реальной задаче.',
  betaCopy:
    'Используй MindPulse для того, что действительно нужно сегодня, и расскажи, что помогло, а что было непонятно. Без выдуманных результатов — просто студенческий проект, который улучшается через честную обратную связь.',
  betaCta: 'Как тестировать бету',
  betaFeedback: 'Поделиться впечатлениями',
};

// NEEDS NATIVE REVIEW (kk): marketing copy translated without native review;
// the language picker labels Kazakh as beta for this reason.
const KK: LandingCopy = {
  navFeatures: 'Мүмкіндіктер',
  navHow: 'Қалай жұмыс істейді',
  navBeta: 'Бета-тест',
  navLogin: 'Кіру',
  navTry: 'Тегін байқап көру',
  badge: 'Студенттік бета — тестілеу кезінде тегін',
  heroTitleLead: 'Оқудан шаршадың ба?',
  heroTitleAccent: 'Бір кішкентай қадамнан баста.',
  heroSubtitle:
    'MindPulse — студенттерге арналған AI кеңістігі. Бір нақты тапсырманы, дедлайнды немесе тығырықты сипатта — ең кіші пайдалы келесі қадамды ұсынады. Сосын жоспарлауға, өткізіп алған күндерден кейін қайта бастауға және кінәсіз рефлексияға көмектеседі.',
  ctaPrimary: 'Қазір байқап көр — кірусіз',
  ctaLogin: 'Кіру',
  guestNote:
    'Қонақтар осы құрылғыда күніне 5 тегін AI хабарлама алады. Тегін аккаунт тарихты сақтап, лимитті 20-ға көтереді.',
  exampleLabel: 'Не алатыныңның мысалы',
  exampleInput: '«Эссе жұмаға дейін, әлі бастаған жоқпын»',
  exampleOutput:
    'Таймерді 10 минутқа қой да, эссе нені дәлелдеу керегі туралы үш шикі тезис жаз. 10 минуттан кейін тоқтауға болады.',
  exampleHighlights: [
    'Кеңес қабырғасы емес, бір келесі әрекет',
    'Өткізіп алған күндерге — Қалпына келу режимі',
  ],
  howLabel: 'Қалай жұмыс істейді',
  howSteps: [
    [
      'Не керегін таңда',
      'Оқу, жоспарлау, мотивация, әдеттер, мақсаттар, рефлексия — немесе Қалпына келу режимі.',
    ],
    [
      'Бір нақты тапсырманы сипатта',
      'Бір сөйлем жеткілікті. Сауалнамасыз және тіркелусіз.',
    ],
    [
      'Бір кішкентай қадам ал',
      'Алдағы 15 минутта бастауға болатын нақты әрекет. Аккаунт тек тарихты сақтау үшін керек.',
    ],
  ],
  featuresLabel: 'Мүмкіндіктер',
  featuresTitle: 'Студентке алға жылжу үшін керектің бәрі.',
  featureNames: [
    'Оқу көмегі',
    'Күнделікті жоспарлаушы',
    'Мотивацияны қалпына келтіру',
    'Әдет жаттықтырушысы',
    'Мақсатты бөлу',
    'Жылдам рефлексия',
    'Қалпына келу режимі',
    'AI чат + Агент',
  ],
  whyLabel: 'Студенттер неге қолданады',
  whyTitle: 'Алдымен жеңілдік. Сосын прогресс.',
  whyItems: [
    'Прокрастинациямен күресуге көмектеседі',
    'Оқу азырақ қысым сезіледі',
    'Ретсіз ойларды айқын қадамдарға айналдырады',
    'Прогресті ретті ұстайды',
  ],
  privacyTitle: 'Жеке аккаунттар, сақталған прогресс.',
  privacyCopy:
    'Чат тарихы мен Агент жоспарлары браузердің ашық күйіне емес, логиніңе байланған. Құпиясөздер тек тұзды хэш түрінде сақталады, ешқашан ашық мәтінмен емес.',
  privacySignup: 'Тегін аккаунт ашу',
  privacyLogin: 'Кіру',
  betaLabel: 'Студенттік бета',
  betaTitle: 'Бір құралды бір нақты тапсырмада байқап көр.',
  betaCopy:
    'MindPulse-ті бүгін шынымен керек нәрсеге қолдан, сосын не көмектескенін, не түсініксіз болғанын айт. Ойдан шығарылған нәтижелер жоқ — тек адал пікір арқылы жақсарып жатқан студенттік жоба.',
  betaCta: 'Бетаны қалай тестілеу керек',
  betaFeedback: 'Пікір қалдыру',
};

const LANDING: Record<LanguageCode, LandingCopy> = { en: EN, ru: RU, kk: KK };

export function landingCopyFor(language: string): LandingCopy {
  return LANDING[language as LanguageCode] ?? EN;
}

/**
 * Localized "this page is English-only" notice for long-form pages that are
 * not yet fully translated (/why, /impact, /case-study, /privacy, /beta).
 * Honest scoping instead of half-translated safety/privacy text.
 */
export const ENGLISH_ONLY_NOTICE: Record<LanguageCode, string> = {
  en: '',
  ru: 'Эта страница пока доступна только на английском. Основной интерфейс приложения переведён на русский.',
  kk: 'Бұл бет әзірге тек ағылшын тілінде. Қолданбаның негізгі интерфейсі қазақ тіліне аударылған.',
};
