import type { MarketingLocale } from '../seo';

type AcquisitionLinksCopy = {
  eyebrow: string;
  title: string;
  plannerTitle: string;
  plannerDescription: string;
  recoveryTitle: string;
  recoveryDescription: string;
  readLabel: string;
  plannerNav: string;
  recoveryNav: string;
};

const COPY: Record<MarketingLocale, AcquisitionLinksCopy> = {
  en: {
    eyebrow: 'Practical study guides',
    title: 'Start with the problem you need to solve today.',
    plannerTitle: 'Build a realistic study plan with AI',
    plannerDescription:
      'Turn assignments, exams, deadlines, and limited time into a plan you can adjust.',
    recoveryTitle: 'Catch up after missed classes or overdue work',
    recoveryDescription:
      'Use a calm recovery process to sort what matters, contact the right people, and restart.',
    readLabel: 'Read the guide',
    plannerNav: 'AI study planner',
    recoveryNav: 'Catch-up guide',
  },
  ru: {
    eyebrow: 'Практические материалы',
    title: 'Начни с учебной проблемы, которую нужно решить сегодня.',
    plannerTitle: 'Составить реалистичный план учёбы с ИИ',
    plannerDescription:
      'Преврати задания, экзамены, дедлайны и доступное время в план, который легко менять.',
    recoveryTitle: 'Наверстать учёбу после пропусков и долгов',
    recoveryDescription:
      'Спокойно разберись, что важно, с кем нужно связаться и с какого шага вернуться к учёбе.',
    readLabel: 'Открыть руководство',
    plannerNav: 'ИИ-планировщик учёбы',
    recoveryNav: 'Как наверстать учёбу',
  },
  kk: {
    eyebrow: 'Практикалық оқу нұсқаулықтары',
    title: 'Бүгін шешу керек оқу мәселесінен баста.',
    plannerTitle: 'ЖИ көмегімен шынайы оқу жоспарын құру',
    plannerDescription:
      'Тапсырмалар, емтихандар, мерзімдер мен бос уақытты өзгертуге болатын жоспарға айналдыр.',
    recoveryTitle: 'Өткізіп алған сабақтар мен жиналған тапсырмаларды реттеу',
    recoveryDescription:
      'Маңыздысын анықтап, кіммен сөйлесу керегін белгілеп, оқуға қайта кірісу жоспарын құр.',
    readLabel: 'Нұсқаулықты оқу',
    plannerNav: 'ЖИ оқу жоспарлаушысы',
    recoveryNav: 'Оқуға қайта оралу',
  },
  es: {
    eyebrow: 'Guías prácticas de estudio',
    title: 'Empieza por el problema académico que necesitas resolver hoy.',
    plannerTitle: 'Crear un plan de estudio realista con IA',
    plannerDescription:
      'Convierte tareas, exámenes, entregas y tiempo disponible en un plan que puedas ajustar.',
    recoveryTitle: 'Ponerte al día después de faltar o acumular tareas',
    recoveryDescription:
      'Ordena lo importante, decide con quién hablar y retoma el estudio sin intentar hacerlo todo a la vez.',
    readLabel: 'Leer la guía',
    plannerNav: 'Planificador con IA',
    recoveryNav: 'Cómo ponerse al día',
  },
};

export function acquisitionLinksCopyFor(locale: MarketingLocale) {
  return COPY[locale];
}
