import type { MarketingLocale } from '../seo';

export type AcquisitionPageId = 'ai-study-planner' | 'catch-up-on-schoolwork';

export type AcquisitionPageCopy = {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  answerTitle: string;
  answerBody: string;
  fitTitle: string;
  fitItems: string[];
  stepsTitle: string;
  stepsIntro: string;
  steps: Array<{ title: string; body: string }>;
  exampleTitle: string;
  exampleContext: string;
  exampleItems: string[];
  limitsTitle: string;
  limitsIntro: string;
  limits: string[];
  faqTitle: string;
  faqs: Array<{ question: string; answer: string }>;
  ctaTitle: string;
  ctaBody: string;
  ctaLabel: string;
};

type LocalizedAcquisitionPage = Record<MarketingLocale, AcquisitionPageCopy>;

const PAGES: Record<AcquisitionPageId, LocalizedAcquisitionPage> = {
  'ai-study-planner': {
    en: {
      metadataTitle: 'AI Study Planner for Students — Build a Realistic Plan',
      metadataDescription:
        'Create a realistic study plan from assignments, exams, deadlines, and the time you actually have. See a practical workflow, example plan, and honest limits.',
      eyebrow: 'AI study planner for students',
      title: 'Build a realistic study plan with AI.',
      intro:
        'A useful study plan does more than list every task. It shows what matters first, breaks large assignments into startable steps, protects time for rest, and changes when your week changes. MindPulse helps you turn a messy workload into the next few actions without requiring a perfect schedule.',
      answerTitle: 'What an AI study planner should do',
      answerBody:
        'Give it the work you know about, the real deadlines, and the time you can use. A good result should rank the work, split vague tasks into concrete actions, and leave room to adjust. It should not fill every hour or pretend it knows deadlines you did not provide.',
      fitTitle: 'This approach is useful when you…',
      fitItems: [
        'have several assignments and cannot tell where to begin',
        'need an exam study plan that fits around classes, work, or family time',
        'keep moving unfinished tasks to tomorrow',
        'missed a few days and need to rebuild the week',
        'want one clear next action instead of a complicated productivity system',
      ],
      stepsTitle: 'How to create a study plan that you can follow',
      stepsIntro:
        'You can use this process in MindPulse or on paper. The quality of the plan depends on honest inputs, not on adding more detail.',
      steps: [
        {
          title: 'Collect the work in one place',
          body: 'Write down assignments, exams, reading, revision, and any overdue work. Do not organize yet; first make the workload visible.',
        },
        {
          title: 'Add deadlines and consequences',
          body: 'Mark confirmed due dates and note what requires a teacher, classmate, or group. If a date is uncertain, label it for verification instead of guessing.',
        },
        {
          title: 'Use your real available time',
          body: 'Plan around classes, sleep, meals, travel, work, care duties, and breaks. Three honest 25-minute blocks are more useful than an imaginary six-hour session.',
        },
        {
          title: 'Turn projects into visible actions',
          body: 'Replace “work on essay” with a first action such as “open the brief and list three possible claims.” Make the next step small enough to start.',
        },
        {
          title: 'Review and adjust daily',
          body: 'Move unfinished work deliberately, update new deadlines, and remove tasks that no longer matter. A changed plan is not a failed plan.',
        },
      ],
      exampleTitle: 'Example: planning a crowded week',
      exampleContext:
        'Suppose it is Monday evening. You have a biology quiz on Thursday, a history essay due Friday, and an overdue maths worksheet. You have 75 minutes tonight and 45 minutes on Tuesday.',
      exampleItems: [
        'Monday: confirm the essay requirements, complete the first five maths questions, and list biology topics you cannot yet explain.',
        'Tuesday: ask the teacher which overdue maths questions are essential, outline the history essay, and review one weak biology topic.',
        'Wednesday: draft the essay body, test yourself on biology without notes, then decide what still needs attention.',
        'Thursday: take the quiz, revise the essay against the brief, and submit only after checking the deadline and required format.',
      ],
      limitsTitle: 'What MindPulse does not automate',
      limitsIntro:
        'MindPulse is planning support, not a school information system. Keeping that boundary clear makes the plan safer and more useful.',
      limits: [
        'It does not automatically read your school portal, calendar, syllabus, or email.',
        'It cannot confirm a deadline or teacher requirement unless you provide and verify it.',
        'AI suggestions can be incomplete or wrong, so check important academic information.',
        'It should support your own learning, not produce work you are expected to do yourself.',
      ],
      faqTitle: 'Common questions',
      faqs: [
        {
          question: 'Is an AI study planner different from a calendar?',
          answer:
            'A calendar shows when something happens. A study planner also helps decide what to do first and how to break the work down. You can transfer the final plan into any calendar you already use.',
        },
        {
          question: 'Can I make an exam study plan?',
          answer:
            'Yes. Include the exam date, topics, what you already understand, available study blocks, and any practice material. Leave time to test recall instead of only rereading notes.',
        },
        {
          question: 'Do I need an account?',
          answer:
            'No. Guest use is available. A free account is only needed if you want MindPulse to save account chat history and plans.',
        },
        {
          question: 'What if I am already behind?',
          answer:
            'Start by separating urgent requirements from work that can be renegotiated or dropped. The catch-up guide below gives a recovery workflow for missed classes and overdue tasks.',
        },
      ],
      ctaTitle: 'Turn today’s workload into a next step.',
      ctaBody:
        'Open the MindPulse Daily Planner with one real deadline, the tasks you know about, and the time you actually have. Verify the result before relying on it.',
      ctaLabel: 'Open the Daily Planner',
    },
    ru: {
      metadataTitle: 'ИИ-планировщик учёбы — составить реалистичный план',
      metadataDescription:
        'Составьте реалистичный план учёбы из заданий, экзаменов, дедлайнов и доступного времени. Пошаговый способ, пример и честные ограничения.',
      eyebrow: 'ИИ-планировщик учёбы для студентов',
      title: 'Составь реалистичный план учёбы с ИИ.',
      intro:
        'Полезный учебный план — не просто список всех дел. Он показывает, что важно сейчас, разбивает большие задания на понятные шаги, оставляет время на отдых и меняется вместе с неделей. MindPulse помогает превратить сумбурную нагрузку в несколько ближайших действий без требования составить идеальное расписание.',
      answerTitle: 'Что должен делать ИИ-планировщик учёбы',
      answerBody:
        'Передай ему известные задания, реальные сроки и время, которым действительно располагаешь. Хороший план расставит приоритеты, превратит расплывчатые задачи в конкретные действия и оставит место для изменений. Он не должен занимать каждый час или придумывать сроки, которых ты не указал.',
      fitTitle: 'Такой подход пригодится, если ты…',
      fitItems: [
        'видишь несколько заданий и не понимаешь, с какого начать',
        'готовишься к экзамену, но учёбу нужно совместить с парами, работой или семейными делами',
        'каждый день переносишь незавершённые задачи на завтра',
        'пропустил несколько дней и хочешь заново собрать неделю',
        'нуждаешься в одном ясном действии, а не в сложной системе продуктивности',
      ],
      stepsTitle: 'Как составить план учёбы, который можно выполнить',
      stepsIntro:
        'Этот способ работает в MindPulse и на бумаге. Качество плана зависит от честных исходных данных, а не от количества пунктов.',
      steps: [
        {
          title: 'Собери все задачи в одном месте',
          body: 'Запиши задания, экзамены, чтение, повторение и долги. Пока не сортируй: сначала сделай всю нагрузку видимой.',
        },
        {
          title: 'Добавь сроки и последствия',
          body: 'Отметь подтверждённые дедлайны и задачи, для которых нужен преподаватель, одногруппник или команда. Неизвестную дату пометь для проверки, а не угадывай.',
        },
        {
          title: 'Учитывай реальное свободное время',
          body: 'Оставь место для занятий, сна, еды, дороги, работы, домашних обязанностей и перерывов. Три честных блока по 25 минут полезнее воображаемых шести часов.',
        },
        {
          title: 'Разбей проекты на видимые действия',
          body: 'Вместо «заняться рефератом» запиши первый шаг: «открыть требования и выписать три возможных тезиса». Следующее действие должно быть достаточно маленьким, чтобы начать.',
        },
        {
          title: 'Каждый день пересматривай план',
          body: 'Осознанно переноси незавершённое, добавляй новые сроки и убирай то, что больше не важно. Изменившийся план — не провал.',
        },
      ],
      exampleTitle: 'Пример: как разобрать загруженную неделю',
      exampleContext:
        'Допустим, сейчас вечер понедельника. В четверг контрольная по биологии, в пятницу нужно сдать работу по истории, а лист заданий по алгебре уже просрочен. Сегодня есть 75 минут, во вторник — 45.',
      exampleItems: [
        'Понедельник: проверить требования к работе, решить первые пять задач по алгебре и выписать темы по биологии, которые пока не получается объяснить.',
        'Вторник: уточнить у преподавателя обязательную часть долга, составить план работы по истории и повторить одну слабую тему по биологии.',
        'Среда: написать основную часть работы, проверить себя по биологии без конспекта и определить, что ещё требует внимания.',
        'Четверг: написать контрольную, сверить работу по истории с требованиями и проверить срок и формат перед отправкой.',
      ],
      limitsTitle: 'Что MindPulse не автоматизирует',
      limitsIntro:
        'MindPulse помогает планировать, но не заменяет школьную или университетскую систему. Эта граница делает план надёжнее.',
      limits: [
        'Он не читает автоматически учебный портал, календарь, программу курса или почту.',
        'Он не может подтвердить дедлайн или требование преподавателя без твоих данных и проверки.',
        'Предложения ИИ могут быть неполными или ошибочными — важную учебную информацию нужно проверять.',
        'Инструмент должен поддерживать твоё обучение, а не выполнять за тебя работу, которую нужно сделать самостоятельно.',
      ],
      faqTitle: 'Частые вопросы',
      faqs: [
        {
          question: 'Чем ИИ-планировщик отличается от календаря?',
          answer:
            'Календарь показывает, когда что-то происходит. Планировщик ещё помогает выбрать приоритет и разбить работу на шаги. Готовый план можно перенести в любой привычный календарь.',
        },
        {
          question: 'Можно ли составить план подготовки к экзамену?',
          answer:
            'Да. Укажи дату экзамена, темы, текущие знания, доступные блоки времени и материалы для практики. Запланируй самопроверку, а не только перечитывание конспекта.',
        },
        {
          question: 'Нужна ли регистрация?',
          answer:
            'Нет, гостевой режим доступен без аккаунта. Бесплатный аккаунт нужен только для сохранения истории чата и планов в аккаунте.',
        },
        {
          question: 'Что делать, если я уже отстал от программы?',
          answer:
            'Сначала отдели срочные обязательные задачи от тех, срок которых можно обсудить или которые уже не нужны. Руководство по возвращению к учёбе ниже даёт отдельный план для пропусков и долгов.',
        },
      ],
      ctaTitle: 'Преврати сегодняшнюю нагрузку в следующий шаг.',
      ctaBody:
        'Открой «Ежедневный планировщик» MindPulse и укажи один реальный срок, известные задачи и доступное время. Проверь результат, прежде чем на него полагаться.',
      ctaLabel: 'Открыть планировщик',
    },
    kk: {
      metadataTitle: 'ЖИ көмегімен оқу жоспарын құру — MindPulse',
      metadataDescription:
        'Тапсырмалар, емтихандар, мерзімдер және бос уақыт негізінде орындалатын оқу жоспарын құрыңыз. Қадамдар, мысал және шектеулер көрсетілген.',
      eyebrow: 'Студенттерге арналған ЖИ оқу жоспарлаушысы',
      title: 'ЖИ көмегімен шынайы оқу жоспарын құр.',
      intro:
        'Пайдалы оқу жоспары барлық тапсырманы тізіп қана қоймайды. Ол алдымен не маңызды екенін көрсетеді, үлкен жұмысты бастауға болатын қадамдарға бөледі, демалысқа уақыт қалдырады және апта өзгерсе, бірге өзгереді. MindPulse ретсіз оқу жүктемесін мінсіз кесте талап етпей, бірнеше нақты әрекетке айналдыруға көмектеседі.',
      answerTitle: 'ЖИ оқу жоспарлаушысы не істеуі керек',
      answerBody:
        'Белгілі тапсырмаларды, нақты мерзімдерді және шынымен қолжетімді уақытты енгіз. Жақсы жоспар жұмысты маңыздылығына қарай реттеп, түсініксіз тапсырмаларды нақты әрекетке бөліп, өзгеріске орын қалдырады. Ол әр сағатты толтырмауы және сен бермеген мерзімді ойдан шығармауы керек.',
      fitTitle: 'Бұл тәсіл мына жағдайда пайдалы',
      fitItems: [
        'бірнеше тапсырма бар, бірақ неден бастау керегі түсініксіз болса',
        'емтиханға дайындықты сабақ, жұмыс немесе отбасы міндеттерімен үйлестіру керек болса',
        'аяқталмаған тапсырмалар күн сайын ертеңге ауыса берсе',
        'бірнеше күнді өткізіп алып, аптаны қайта құру керек болса',
        'күрделі өнімділік жүйесінің орнына бір анық әрекет қажет болса',
      ],
      stepsTitle: 'Орындауға болатын оқу жоспарын қалай құруға болады',
      stepsIntro:
        'Бұл тәсілді MindPulse ішінде де, қағазда да қолдануға болады. Жоспардың сапасы тармақ санына емес, бастапқы ақпараттың шынайылығына байланысты.',
      steps: [
        {
          title: 'Барлық жұмысты бір жерге жина',
          body: 'Тапсырмаларды, емтихандарды, оқуды, қайталауды және кешіккен жұмыстарды жаз. Әзірге реттеме: алдымен толық жүктемені көр.',
        },
        {
          title: 'Мерзімдер мен салдарын белгіле',
          body: 'Расталған тапсыру күндерін және мұғалім, топтас немесе команда қажет болатын жұмыстарды көрсет. Белгісіз күнді болжаудың орнына тексеру керек деп белгіле.',
        },
        {
          title: 'Нақты бос уақытты есепке ал',
          body: 'Сабақ, ұйқы, тамақ, жол, жұмыс, үй міндеттері және үзілістерді ескер. Шынайы үш 25 минуттық бөлік ойдан шығарылған алты сағаттан пайдалырақ.',
        },
        {
          title: 'Үлкен жұмысты көрінетін әрекетке бөл',
          body: '«Жоба жасау» орнына «талаптарды ашып, үш негізгі ой жазу» сияқты алғашқы қадамды белгіле. Келесі әрекет бастауға жеткілікті шағын болсын.',
        },
        {
          title: 'Жоспарды күн сайын жаңарт',
          body: 'Бітпеген жұмысты саналы түрде ауыстыр, жаңа мерзімдерді қос және маңызын жоғалтқанын алып таста. Өзгерген жоспар — сәтсіз жоспар емес.',
        },
      ],
      exampleTitle: 'Мысал: жүктемесі көп аптаны жоспарлау',
      exampleContext:
        'Дүйсенбі кеші деп алайық. Бейсенбіде биологиядан бақылау, жұмада тарих жобасын тапсыру керек, ал математика тапсырмасы кешігіп қалған. Бүгін 75 минут, сейсенбіде 45 минут бар.',
      exampleItems: [
        'Дүйсенбі: тарих жобасының талаптарын тексеру, математикадан алғашқы бес есепті орындау және биологиядан түсіндіре алмайтын тақырыптарды жазу.',
        'Сейсенбі: мұғалімнен кешіккен тапсырманың міндетті бөлігін сұрау, тарих жобасының жоспарын құру және биологияның бір әлсіз тақырыбын қайталау.',
        'Сәрсенбі: жобаның негізгі бөлігін жазу, конспектісіз биологиядан өзін тексеру және қалған жұмысты анықтау.',
        'Бейсенбі: бақылауды тапсыру, тарих жобасын талаптармен салыстыру және жіберер алдында мерзім мен форматты тексеру.',
      ],
      limitsTitle: 'MindPulse нені автоматтандырмайды',
      limitsIntro:
        'MindPulse жоспарлауға көмектеседі, бірақ мектептің немесе университеттің ақпараттық жүйесі емес. Бұл шекара жоспарды қауіпсіз әрі пайдалы етеді.',
      limits: [
        'Ол оқу порталын, күнтізбені, силлабусты немесе email-ды автоматты түрде оқымайды.',
        'Сен ақпарат беріп, тексермейінше, мерзімді немесе мұғалім талабын растай алмайды.',
        'ЖИ ұсынысы толық емес не қате болуы мүмкін, сондықтан маңызды оқу ақпаратын тексеру керек.',
        'Құрал сенің оқуыңды қолдауы керек, өзің орындауға тиіс жұмысты сен үшін жасамауы керек.',
      ],
      faqTitle: 'Жиі қойылатын сұрақтар',
      faqs: [
        {
          question: 'ЖИ оқу жоспарлаушысы күнтізбеден несімен ерекшеленеді?',
          answer:
            'Күнтізбе оқиғаның уақытын көрсетеді. Оқу жоспарлаушысы алдымен не істеу керегін және жұмысты қалай бөлуге болатынын анықтауға көмектеседі. Дайын жоспарды өз күнтізбеңе енгізуге болады.',
        },
        {
          question: 'Емтиханға дайындық жоспарын құруға бола ма?',
          answer:
            'Иә. Емтихан күнін, тақырыптарды, нені білетініңді, бос уақытты және жаттығу материалдарын енгіз. Тек қайта оқуды емес, өзіңді тексеруді де жоспарла.',
        },
        {
          question: 'Аккаунт керек пе?',
          answer:
            'Жоқ, қонақ режимін аккаунтсыз пайдалануға болады. Тегін аккаунт чат тарихы мен жоспарларды аккаунтта сақтау үшін ғана керек.',
        },
        {
          question: 'Оқудан қалып қойсам не істеу керек?',
          answer:
            'Алдымен шұғыл міндетті жұмысты мерзімін талқылауға болатын немесе енді қажет емес тапсырмадан бөл. Төмендегі нұсқаулық өткізіп алған сабақтар мен жиналған тапсырмаларға арналған қалпына келу жолын көрсетеді.',
        },
      ],
      ctaTitle: 'Бүгінгі оқу жүктемесін келесі қадамға айналдыр.',
      ctaBody:
        'MindPulse күнделікті жоспарлаушысын ашып, бір нақты мерзімді, белгілі тапсырмаларды және бос уақытты енгіз. Нәтижеге сүйенбес бұрын оны тексер.',
      ctaLabel: 'Күнделікті жоспарлаушыны ашу',
    },
    es: {
      metadataTitle: 'Planificador de estudio con IA — Crea un plan realista',
      metadataDescription:
        'Crea un plan de estudio realista con tareas, exámenes, entregas y el tiempo que de verdad tienes. Incluye un proceso práctico, ejemplo y límites claros.',
      eyebrow: 'Planificador de estudio con IA para estudiantes',
      title: 'Crea un plan de estudio realista con IA.',
      intro:
        'Un buen plan de estudio no se limita a enumerar pendientes. Te ayuda a decidir qué va primero, divide los trabajos grandes en pasos que puedes empezar, reserva tiempo para descansar y cambia cuando cambia tu semana. MindPulse convierte una carga desordenada en las próximas acciones sin pedirte un horario perfecto.',
      answerTitle: 'Qué debería hacer un planificador de estudio con IA',
      answerBody:
        'Dale las tareas que conoces, las fechas reales y el tiempo del que dispones. Un resultado útil prioriza, convierte objetivos vagos en acciones concretas y deja margen para ajustar. No debería ocupar cada hora ni inventar fechas que no proporcionaste.',
      fitTitle: 'Este método puede ayudarte si…',
      fitItems: [
        'tienes varias entregas y no sabes por dónde empezar',
        'necesitas preparar un examen sin descuidar clases, trabajo o responsabilidades familiares',
        'sigues pasando tareas incompletas al día siguiente',
        'faltaste varios días y necesitas reconstruir la semana',
        'prefieres una siguiente acción clara a otro sistema complicado de productividad',
      ],
      stepsTitle: 'Cómo crear un plan de estudio que puedas cumplir',
      stepsIntro:
        'Puedes seguir este proceso en MindPulse o en papel. La calidad del plan depende de datos sinceros, no de añadir más apartados.',
      steps: [
        {
          title: 'Reúne todo el trabajo en un lugar',
          body: 'Anota tareas, exámenes, lecturas, repasos y entregas atrasadas. No lo ordenes todavía: primero haz visible la carga completa.',
        },
        {
          title: 'Añade fechas y consecuencias',
          body: 'Marca las fechas confirmadas y lo que requiere hablar con un docente, un compañero o tu grupo. Si una fecha no está clara, anótala para verificarla en vez de adivinar.',
        },
        {
          title: 'Usa el tiempo que de verdad tienes',
          body: 'Planifica alrededor de clases, sueño, comidas, trayectos, trabajo, cuidados y descansos. Tres bloques reales de 25 minutos sirven más que una sesión imaginaria de seis horas.',
        },
        {
          title: 'Convierte los proyectos en acciones visibles',
          body: 'Cambia “avanzar el ensayo” por un primer paso como “abrir las instrucciones y escribir tres ideas posibles”. La siguiente acción debe ser lo bastante pequeña para empezar.',
        },
        {
          title: 'Revisa y ajusta cada día',
          body: 'Reprograma lo pendiente con intención, actualiza las fechas y elimina lo que ya no importa. Cambiar el plan no significa que el plan haya fallado.',
        },
      ],
      exampleTitle: 'Ejemplo: organizar una semana cargada',
      exampleContext:
        'Imagina que es lunes por la tarde. Tienes un examen de biología el jueves, un informe de historia para el viernes y ejercicios de matemáticas atrasados. Hoy dispones de 75 minutos y el martes, de 45.',
      exampleItems: [
        'Lunes: confirmar los requisitos del informe, resolver los primeros cinco ejercicios de matemáticas y anotar qué temas de biología todavía no puedes explicar.',
        'Martes: preguntar al docente qué parte del trabajo atrasado es imprescindible, preparar el esquema de historia y repasar un tema débil de biología.',
        'Miércoles: redactar el cuerpo del informe, comprobar lo que recuerdas de biología sin mirar apuntes y decidir qué necesita más atención.',
        'Jueves: hacer el examen, revisar el informe con las instrucciones y confirmar fecha y formato antes de entregarlo.',
      ],
      limitsTitle: 'Lo que MindPulse no automatiza',
      limitsIntro:
        'MindPulse ayuda a planificar, pero no es el sistema académico de tu centro. Mantener ese límite claro hace que el plan sea más seguro y útil.',
      limits: [
        'No lee automáticamente el campus virtual, el calendario, el programa ni tu correo.',
        'No puede confirmar una fecha o requisito docente si no lo proporcionas y verificas.',
        'Las sugerencias de IA pueden ser incompletas o incorrectas; comprueba la información académica importante.',
        'Debe apoyar tu aprendizaje, no producir el trabajo que te corresponde hacer.',
      ],
      faqTitle: 'Preguntas frecuentes',
      faqs: [
        {
          question: '¿En qué se diferencia de un calendario?',
          answer:
            'Un calendario muestra cuándo ocurre algo. Un planificador también ayuda a decidir qué hacer primero y cómo dividir el trabajo. Puedes pasar el plan final al calendario que ya uses.',
        },
        {
          question: '¿Puedo crear un plan para preparar un examen?',
          answer:
            'Sí. Incluye la fecha, los temas, lo que ya entiendes, los bloques disponibles y el material de práctica. Reserva tiempo para recordar sin apuntes, no solo para releer.',
        },
        {
          question: '¿Necesito una cuenta?',
          answer:
            'No. Puedes entrar como invitado. La cuenta gratuita solo es necesaria si quieres guardar en ella el historial de chat y los planes.',
        },
        {
          question: '¿Qué hago si ya voy atrasado?',
          answer:
            'Empieza separando los requisitos urgentes de lo que puede renegociarse o descartarse. La guía para ponerse al día que aparece abajo ofrece un proceso específico para faltas y tareas atrasadas.',
        },
      ],
      ctaTitle: 'Convierte la carga de hoy en una siguiente acción.',
      ctaBody:
        'Abre el Planificador diario de MindPulse con una fecha real, las tareas que conoces y el tiempo que de verdad tienes. Verifica el resultado antes de depender de él.',
      ctaLabel: 'Abrir el Planificador diario',
    },
  },
  'catch-up-on-schoolwork': {
    en: {
      metadataTitle: 'How to Catch Up on Missed Schoolwork Without Panicking',
      metadataDescription:
        'A practical way to catch up after missed classes or overdue assignments: make the work visible, verify priorities, contact teachers, and restart in small steps.',
      eyebrow: 'Catch-up plan for students',
      title:
        'Catch up on missed schoolwork without trying to do everything at once.',
      intro:
        'Falling behind can make every task feel equally urgent. The fastest-looking response—staying up late and attacking the whole pile—often creates more confusion. A recovery plan starts by finding out what still matters, what can be negotiated, and what one action will reduce uncertainty today.',
      answerTitle: 'Start with triage, not guilt',
      answerBody:
        'Your first job is not to finish everything. It is to replace an unknown pile with a verified list. Confirm what is due, what still earns credit, what depends on another person, and what can wait. Then choose a small block of work that makes tomorrow easier.',
      fitTitle: 'Use this recovery process when…',
      fitItems: [
        'illness, stress, family responsibilities, or low energy caused missed days',
        'several assignments are overdue and the school portal feels impossible to open',
        'you do not know which teacher or task to approach first',
        'you have started avoiding messages because the backlog feels embarrassing',
        'a normal weekly planner no longer reflects your actual situation',
      ],
      stepsTitle: 'A five-step schoolwork recovery plan',
      stepsIntro:
        'This is a sorting process, not a promise to erase the backlog in one night. Ask a trusted adult, teacher, adviser, or classmate for help if the list is unclear.',
      steps: [
        {
          title: 'Make one complete, imperfect list',
          body: 'Check the school portal, course pages, messages, and notes once. Record each missing or upcoming item with the subject. Stop searching after the list is usable; you can correct it later.',
        },
        {
          title: 'Verify what still matters',
          body: 'Mark confirmed deadlines, available credit, exam prerequisites, and tasks that are no longer accepted. If you are unsure, write a short question for the teacher instead of assuming.',
        },
        {
          title: 'Sort by consequence and dependency',
          body: 'Prioritize work that unlocks another task, affects an imminent assessment, or requires someone else to respond. A small email may be more useful than an hour spent on the wrong assignment.',
        },
        {
          title: 'Choose one recovery block',
          body: 'Pick 15–30 minutes and define an observable finish line: send two messages, complete five problems, or outline one paragraph. Stop at the boundary and reassess.',
        },
        {
          title: 'Build the next three days, not the whole semester',
          body: 'Plan a small number of blocks around sleep and existing commitments. Update the plan when teachers respond. Recovery becomes manageable when each day reduces uncertainty.',
        },
      ],
      exampleTitle: 'Example: a three-day restart',
      exampleContext:
        'A student returns after four missed days with two overdue worksheets, an essay due soon, and notes missing from one lesson. A realistic restart could look like this:',
      exampleItems: [
        'Day 1: make the full list, ask both teachers what still needs submission, and complete one short worksheet section.',
        'Day 2: use the replies to remove or reorder tasks, get the missing notes from a classmate, and outline the essay.',
        'Day 3: finish the highest-value overdue task, draft the first essay section, and plan the next two study blocks.',
        'At each step: record what changed so the same uncertainty does not return tomorrow.',
      ],
      limitsTitle: 'When a planning tool is not enough',
      limitsIntro:
        'Some backlogs need human flexibility or wider support. Asking early usually gives other people more room to help.',
      limits: [
        'MindPulse cannot change deadlines, attendance rules, grades, or teacher decisions.',
        'If illness, disability, caring duties, housing, finances, or mental health are affecting school, contact an appropriate trusted adult or student-support service.',
        'If you feel unsafe or are in immediate danger, use local emergency support rather than a study tool.',
        'AI may misunderstand your situation; verify requirements and do not share sensitive documents or personal details.',
      ],
      faqTitle: 'Common questions',
      faqs: [
        {
          question: 'Should I start with the oldest missing assignment?',
          answer:
            'Not automatically. First check whether it is still accepted and whether another task has a closer consequence. The best first task is the one that reduces the most risk or uncertainty for the time available.',
        },
        {
          question: 'What should I say to a teacher?',
          answer:
            'Keep it short and specific: say you are making a recovery plan, list the work you believe is missing, and ask which item should come first or whether any deadline has changed.',
        },
        {
          question: 'How many hours should I study to catch up?',
          answer:
            'There is no safe universal number. Start from the time you can use without removing essential sleep, meals, classes, work, or care. Short verified blocks are better than an unrealistic marathon.',
        },
        {
          question: 'Can MindPulse make the recovery plan for me?',
          answer:
            'Recovery Mode can organize the items and constraints you provide into a short plan. You still need to confirm school requirements and decide what is realistic.',
        },
      ],
      ctaTitle: 'Make the backlog visible and choose one restart step.',
      ctaBody:
        'Open Recovery Mode with the assignments you know about, confirmed deadlines, and the time you have today. Keep private or sensitive details out of the chat.',
      ctaLabel: 'Open Recovery Mode',
    },
    ru: {
      metadataTitle: 'Как наверстать учёбу после пропусков и разобрать долги',
      metadataDescription:
        'Практический план после пропусков: собрать задания, проверить приоритеты, связаться с преподавателями и вернуться к учёбе маленькими шагами.',
      eyebrow: 'План возвращения к учёбе',
      title: 'Наверстай учёбу после пропусков, не пытаясь сделать всё сразу.',
      intro:
        'Когда накапливаются долги, каждая задача кажется одинаково срочной. Самая быстрая на вид реакция — не спать и взяться за всю кучу — часто только усиливает путаницу. План восстановления начинается с проверки: что ещё важно, о чём можно договориться и какое одно действие сегодня уменьшит неопределённость.',
      answerTitle: 'Начни с разбора, а не с чувства вины',
      answerBody:
        'Первая задача — не закончить всё, а превратить неизвестную кучу в проверенный список. Уточни, что нужно сдать, за что ещё можно получить баллы, где требуется ответ другого человека и что может подождать. Затем выбери короткий блок работы, который упростит завтрашний день.',
      fitTitle: 'Этот способ пригодится, если…',
      fitItems: [
        'болезнь, стресс, семейные обязанности или нехватка сил привели к пропускам',
        'просрочено несколько заданий и страшно даже открыть учебный портал',
        'непонятно, к какому преподавателю или предмету обратиться сначала',
        'ты избегаешь сообщений, потому что стыдно за накопившиеся долги',
        'обычный недельный план больше не соответствует реальной ситуации',
      ],
      stepsTitle: 'Пять шагов для возвращения к учёбе',
      stepsIntro:
        'Это способ навести порядок, а не обещание убрать все долги за один вечер. Если список непонятен, попроси помощи у близкого взрослого, преподавателя, куратора или одногруппника.',
      steps: [
        {
          title: 'Составь один полный, пусть и неидеальный список',
          body: 'Один раз проверь учебный портал, страницы курсов, сообщения и записи. Выпиши каждую пропущенную и ближайшую задачу с названием предмета. Остановись, когда список уже можно использовать; исправить его получится позже.',
        },
        {
          title: 'Проверь, что ещё имеет значение',
          body: 'Отметь подтверждённые сроки, возможность получить баллы, допуски к контрольным и задания, которые уже не принимают. Если не уверен, подготовь короткий вопрос преподавателю вместо догадки.',
        },
        {
          title: 'Сортируй по последствиям и зависимостям',
          body: 'Сначала поставь работу, которая открывает следующую задачу, влияет на ближайшую проверку или требует чужого ответа. Короткое письмо иногда полезнее часа, потраченного не на то задание.',
        },
        {
          title: 'Выбери один блок восстановления',
          body: 'Выдели 15–30 минут и определи видимый результат: отправить два сообщения, решить пять задач или набросать один абзац. На границе остановись и снова оцени ситуацию.',
        },
        {
          title: 'Планируй ближайшие три дня, а не весь семестр',
          body: 'Размести несколько коротких блоков вокруг сна и обязательных дел. Обнови план после ответов преподавателей. Возвращение становится посильным, когда каждый день уменьшает неопределённость.',
        },
      ],
      exampleTitle: 'Пример: перезапуск на три дня',
      exampleContext:
        'Студент возвращается после четырёх дней пропусков: две просроченные работы, скоро сдавать эссе, а по одной теме нет конспекта. Реалистичный перезапуск может выглядеть так:',
      exampleItems: [
        'День 1: собрать полный список, спросить двух преподавателей, что ещё нужно сдать, и выполнить короткую часть одной работы.',
        'День 2: по ответам убрать или переставить задачи, попросить конспект у одногруппника и сделать план эссе.',
        'День 3: закончить самый ценный долг, написать первый раздел эссе и назначить следующие два учебных блока.',
        'После каждого шага: записать, что изменилось, чтобы завтра не возвращаться к той же неопределённости.',
      ],
      limitsTitle: 'Когда одного планировщика недостаточно',
      limitsIntro:
        'Некоторые долги требуют человеческой гибкости или более широкой поддержки. Чем раньше попросить, тем больше возможностей помочь.',
      limits: [
        'MindPulse не меняет сроки, правила посещаемости, оценки или решения преподавателей.',
        'Если на учёбу влияют болезнь, инвалидность, уход за близкими, жильё, финансы или психическое состояние, обратись к подходящему взрослому или службе поддержки студентов.',
        'Если ты в опасности, обращайся в местные экстренные службы, а не к учебному инструменту.',
        'ИИ может неверно понять ситуацию: проверяй требования и не отправляй чувствительные документы или личные данные.',
      ],
      faqTitle: 'Частые вопросы',
      faqs: [
        {
          question: 'Нужно ли начинать с самого старого долга?',
          answer:
            'Не обязательно. Сначала проверь, принимают ли его ещё и нет ли задачи с более близкими последствиями. Лучший первый шаг сильнее всего снижает риск или неопределённость за доступное время.',
        },
        {
          question: 'Что написать преподавателю?',
          answer:
            'Коротко и конкретно: скажи, что составляешь план восстановления, перечисли задания, которые считаешь пропущенными, и спроси, с какого начать или изменился ли срок.',
        },
        {
          question: 'Сколько часов нужно заниматься, чтобы наверстать?',
          answer:
            'Универсального безопасного числа нет. Исходи из времени, которое остаётся без ущерба для сна, еды, занятий, работы и заботы о других. Короткие проверенные блоки лучше нереалистичного марафона.',
        },
        {
          question: 'Может ли MindPulse сам составить план?',
          answer:
            'Режим восстановления может собрать указанные задачи и ограничения в короткий план. Проверить требования учебного заведения и решить, что реально, всё равно нужно тебе.',
        },
      ],
      ctaTitle: 'Сделай долги видимыми и выбери один шаг для возвращения.',
      ctaBody:
        'Открой Режим восстановления, добавь известные задания, подтверждённые сроки и время на сегодня. Не вводи в чат личные или чувствительные сведения.',
      ctaLabel: 'Открыть Режим восстановления',
    },
    kk: {
      metadataTitle:
        'Сабақтан қалып қойғанда оқу тапсырмаларын қалай реттеуге болады',
      metadataDescription:
        'Өткізіп алған сабақтардан кейін тапсырмаларды жинау, басымдықтарды тексеру, мұғалімдермен байланысу және оқуға шағын қадаммен оралу жоспары.',
      eyebrow: 'Оқуға қайта оралу жоспары',
      title: 'Барлығын бірден орындамай-ақ, өткізіп алған оқуды ретте.',
      intro:
        'Оқу жұмысы жиналғанда әр тапсырма бірдей шұғыл болып көрінеді. Түнімен ұйықтамай, бүкіл тізімді бірден орындауға тырысу көбіне шатасуды күшейтеді. Қалпына келу жоспары әлі не маңызды екенін, нені келісуге болатынын және бүгін қай әрекет белгісіздікті азайтатынын анықтаудан басталады.',
      answerTitle: 'Кінәдан емес, реттеуден баста',
      answerBody:
        'Алғашқы міндет — бәрін аяқтау емес, белгісіз жұмысты тексерілген тізімге айналдыру. Нені тапсыру керек, қай жұмыс әлі бағаланады, қай жерде басқа адамның жауабы қажет және не күте алатынын анықта. Содан кейін ертеңгі күнді жеңілдететін шағын жұмыс бөлігін таңда.',
      fitTitle: 'Бұл тәсілді мына жағдайда қолдан',
      fitItems: [
        'ауру, күйзеліс, отбасы міндеттері немесе күштің аздығы сабақ өткізуге себеп болса',
        'бірнеше тапсырма кешігіп, оқу порталын ашу қиын болып көрінсе',
        'алдымен қай мұғалімге немесе пәнге жүгіну керегі түсініксіз болса',
        'жиналған жұмыс үшін ұялып, хабарламаларды ашпай жүрсең',
        'әдеттегі апталық жоспар нақты жағдайға сәйкес келмесе',
      ],
      stepsTitle: 'Оқуға оралудың бес қадамы',
      stepsIntro:
        'Бұл — жұмысты бір кеште толық бітіруге уәде емес, реттеу үдерісі. Тізім түсініксіз болса, сенетін ересектен, мұғалімнен, эдвайзерден немесе топтастан көмек сұра.',
      steps: [
        {
          title: 'Бір толық, мінсіз емес тізім жаса',
          body: 'Оқу порталын, курс беттерін, хабарламалар мен жазбаларды бір рет тексер. Әр өткізіп алған және жақындаған тапсырманы пәнімен бірге жаз. Тізім қолдануға жараса, іздеуді тоқтат; кейін түзетуге болады.',
        },
        {
          title: 'Әлі маңызды жұмысты тексер',
          body: 'Расталған мерзімдерді, баға алу мүмкіндігін, емтиханға қажетті шарттарды және енді қабылданбайтын тапсырмаларды белгіле. Сенімсіз болсаң, болжаудың орнына мұғалімге қысқа сұрақ жаз.',
        },
        {
          title: 'Салдары мен тәуелділігіне қарай ретте',
          body: 'Келесі жұмысты ашатын, жақын бағалауға әсер ететін немесе басқа адамның жауабын қажет ететін тапсырманы алға қой. Кейде қысқа хат қате тапсырмаға жұмсалған бір сағаттан пайдалырақ.',
        },
        {
          title: 'Бір қалпына келу бөлігін таңда',
          body: '15–30 минут бөліп, көрінетін нәтиже белгіле: екі хабарлама жіберу, бес есеп шығару немесе бір абзацтың жоспарын жасау. Уақыт біткенде тоқтап, жағдайды қайта бағала.',
        },
        {
          title: 'Бүкіл семестрді емес, келесі үш күнді жоспарла',
          body: 'Ұйқы мен міндеттердің арасына бірнеше шағын жұмыс бөлігін қой. Мұғалімдер жауап бергенде жоспарды жаңарт. Әр күн белгісіздікті азайтса, оқуға оралу жеңілдейді.',
        },
      ],
      exampleTitle: 'Мысал: үш күндік қайта бастау',
      exampleContext:
        'Студент төрт күн сабаққа қатыспай, екі кешіккен тапсырма, жақын эссе мерзімі және бір сабақтың жоқ конспектісімен оралды. Шынайы қайта бастау былай көрінуі мүмкін:',
      exampleItems: [
        '1-күн: толық тізім жасау, екі мұғалімнен әлі нені тапсыру керегін сұрау және бір қысқа тапсырма бөлігін орындау.',
        '2-күн: жауаптарға қарай тапсырмаларды алып тастау не қайта реттеу, топтастан конспект сұрау және эссе жоспарын құру.',
        '3-күн: ең маңызды кешіккен жұмысты аяқтау, эссенің бірінші бөлігін жазу және келесі екі оқу уақытын белгілеу.',
        'Әр қадамнан кейін: ертең сол белгісіздік қайталанбауы үшін не өзгергенін жазу.',
      ],
      limitsTitle: 'Жоспарлау құралы жеткіліксіз болатын жағдайлар',
      limitsIntro:
        'Кейбір оқу қарызы адамның икемділігін немесе кеңірек қолдауды қажет етеді. Ертерек сұрау басқаларға көмектесуге көбірек мүмкіндік береді.',
      limits: [
        'MindPulse мерзімдерді, қатысу ережелерін, бағаларды немесе мұғалім шешімін өзгерте алмайды.',
        'Ауру, мүгедектік, біреуге күтім жасау, тұрғын үй, қаржы немесе психикалық жағдай оқуға әсер етсе, сенімді ересекке не студенттерді қолдау қызметіне хабарлас.',
        'Қауіп төніп тұрса, оқу құралына емес, жергілікті жедел көмекке жүгін.',
        'ЖИ жағдайды қате түсінуі мүмкін; талаптарды тексер және құпия құжаттар мен жеке мәліметтерді жіберме.',
      ],
      faqTitle: 'Жиі қойылатын сұрақтар',
      faqs: [
        {
          question: 'Ең ескі тапсырмадан бастау керек пе?',
          answer:
            'Міндетті емес. Алдымен оның әлі қабылданатынын және жақынырақ салдары бар жұмыс жоқ екенін тексер. Ең жақсы алғашқы тапсырма қолжетімді уақытта тәуекелді немесе белгісіздікті көбірек азайтады.',
        },
        {
          question: 'Мұғалімге не жазуға болады?',
          answer:
            'Қысқа әрі нақты жаз: оқуға оралу жоспарын жасап жатқаныңды айт, өткізіп алдым деп ойлаған тапсырмаларды ата және қайсысынан бастау керегін не мерзім өзгергенін сұра.',
        },
        {
          question: 'Қалып қойған оқуды толықтыру үшін қанша сағат оқу керек?',
          answer:
            'Барлығына ортақ қауіпсіз сан жоқ. Ұйқы, тамақ, сабақ, жұмыс және күтім міндеттерін алып тастамай қолдана алатын уақыттан баста. Қысқа, тексерілген бөліктер шынайы емес марафоннан пайдалырақ.',
        },
        {
          question: 'MindPulse жоспарды өзі құра ала ма?',
          answer:
            'Қалпына келу режимі сен енгізген тапсырмалар мен шектеулерді қысқа жоспарға реттей алады. Оқу орнының талаптарын растау және ненің шынайы екенін шешу сенде қалады.',
        },
      ],
      ctaTitle:
        'Жиналған жұмысты көрінетін етіп, бір қайта бастау қадамын таңда.',
      ctaBody:
        'Қалпына келу режимін ашып, белгілі тапсырмаларды, расталған мерзімдерді және бүгінгі бос уақытты енгіз. Чатқа жеке немесе құпия мәлімет жіберме.',
      ctaLabel: 'Қалпына келу режимін ашу',
    },
    es: {
      metadataTitle: 'Cómo ponerse al día con tareas atrasadas sin agobiarse',
      metadataDescription:
        'Un plan práctico tras faltar a clase o acumular tareas: haz visible el trabajo, verifica prioridades, habla con docentes y retoma con pasos pequeños.',
      eyebrow: 'Plan para retomar los estudios',
      title: 'Ponte al día sin intentar hacer todas las tareas a la vez.',
      intro:
        'Cuando te atrasas, todas las tareas parecen igual de urgentes. La reacción que parece más rápida —dormir menos y atacar toda la pila— suele crear más confusión. Un plan para retomar empieza por descubrir qué sigue siendo importante, qué puedes negociar y qué acción reducirá hoy la incertidumbre.',
      answerTitle: 'Empieza por ordenar, no por culparte',
      answerBody:
        'Tu primera tarea no es terminarlo todo. Es convertir una pila desconocida en una lista verificada. Confirma qué debes entregar, qué todavía cuenta, qué depende de otra persona y qué puede esperar. Después, elige un bloque pequeño que haga que mañana sea más fácil.',
      fitTitle: 'Usa este proceso cuando…',
      fitItems: [
        'una enfermedad, el estrés, responsabilidades familiares o la falta de energía te hicieron faltar',
        'hay varias entregas vencidas y abrir el campus virtual parece imposible',
        'no sabes con qué docente o asignatura empezar',
        'evitas los mensajes porque te avergüenza el trabajo acumulado',
        'tu planificación semanal ya no representa la situación real',
      ],
      stepsTitle: 'Un plan de recuperación académica en cinco pasos',
      stepsIntro:
        'Es un proceso para ordenar, no una promesa de borrar todo el atraso en una noche. Si la lista no está clara, pide ayuda a una persona adulta de confianza, un docente, un orientador o un compañero.',
      steps: [
        {
          title: 'Crea una lista completa, aunque no sea perfecta',
          body: 'Revisa una vez el campus virtual, las páginas de las asignaturas, los mensajes y tus notas. Registra cada tarea pendiente o próxima con su materia. Deja de buscar cuando la lista ya sea útil; podrás corregirla después.',
        },
        {
          title: 'Verifica qué sigue importando',
          body: 'Marca las fechas confirmadas, los trabajos que todavía puntúan, los requisitos de próximos exámenes y lo que ya no se acepta. Si no sabes algo, prepara una pregunta breve para el docente en vez de suponer.',
        },
        {
          title: 'Ordena por consecuencia y dependencia',
          body: 'Prioriza lo que desbloquea otra tarea, afecta una evaluación cercana o necesita la respuesta de otra persona. Un mensaje breve puede servir más que una hora dedicada al trabajo equivocado.',
        },
        {
          title: 'Elige un bloque para retomar',
          body: 'Reserva entre 15 y 30 minutos y define un resultado visible: enviar dos mensajes, resolver cinco ejercicios o preparar el esquema de un párrafo. Al llegar al límite, para y vuelve a evaluar.',
        },
        {
          title: 'Planifica tres días, no todo el semestre',
          body: 'Coloca pocos bloques alrededor del sueño y de tus obligaciones. Actualiza el plan cuando respondan los docentes. Retomar se vuelve manejable cuando cada día reduce la incertidumbre.',
        },
      ],
      exampleTitle: 'Ejemplo: retomar en tres días',
      exampleContext:
        'Un estudiante vuelve después de faltar cuatro días. Tiene dos hojas de ejercicios atrasadas, un ensayo próximo y le faltan apuntes de una clase. Un reinicio realista podría ser:',
      exampleItems: [
        'Día 1: crear la lista completa, preguntar a dos docentes qué hace falta entregar y completar una sección breve de ejercicios.',
        'Día 2: usar las respuestas para eliminar o reordenar tareas, pedir los apuntes a un compañero y preparar el esquema del ensayo.',
        'Día 3: terminar la tarea atrasada de mayor valor, redactar la primera parte del ensayo y programar los dos siguientes bloques de estudio.',
        'En cada paso: anotar qué cambió para que la misma incertidumbre no vuelva mañana.',
      ],
      limitsTitle: 'Cuándo una herramienta de planificación no basta',
      limitsIntro:
        'Algunos atrasos necesitan flexibilidad humana o un apoyo más amplio. Pedir ayuda pronto suele dar a otras personas más margen para responder.',
      limits: [
        'MindPulse no puede cambiar fechas, normas de asistencia, calificaciones ni decisiones docentes.',
        'Si una enfermedad, discapacidad, cuidados, vivienda, dinero o salud mental afectan tus estudios, contacta con una persona de confianza o el servicio de apoyo estudiantil adecuado.',
        'Si estás en peligro inmediato, utiliza los servicios de emergencia de tu zona, no una herramienta de estudio.',
        'La IA puede interpretar mal tu situación; verifica los requisitos y no compartas documentos sensibles ni datos personales.',
      ],
      faqTitle: 'Preguntas frecuentes',
      faqs: [
        {
          question: '¿Debo empezar por la tarea más antigua?',
          answer:
            'No necesariamente. Primero comprueba si todavía la aceptan y si otra tarea tiene una consecuencia más cercana. El mejor primer paso reduce el mayor riesgo o incertidumbre en el tiempo disponible.',
        },
        {
          question: '¿Qué puedo escribirle a un docente?',
          answer:
            'Sé breve y concreto: explica que estás preparando un plan para ponerte al día, enumera lo que crees que falta y pregunta qué debería ir primero o si cambió alguna fecha.',
        },
        {
          question: '¿Cuántas horas debo estudiar para ponerme al día?',
          answer:
            'No existe una cifra universal y segura. Parte del tiempo que puedas usar sin quitar sueño, comidas, clases, trabajo o cuidados esenciales. Los bloques breves y verificados funcionan mejor que una maratón irreal.',
        },
        {
          question: '¿Puede MindPulse crear el plan por mí?',
          answer:
            'El Modo Recuperación puede ordenar las tareas y límites que proporciones en un plan breve. Tú debes confirmar los requisitos del centro y decidir qué es realista.',
        },
      ],
      ctaTitle: 'Haz visible lo atrasado y elige un paso para retomar.',
      ctaBody:
        'Abre el Modo Recuperación con las tareas que conoces, las fechas confirmadas y el tiempo que tienes hoy. No incluyas datos privados o sensibles en el chat.',
      ctaLabel: 'Abrir el Modo Recuperación',
    },
  },
};

export function acquisitionPageCopyFor(
  id: AcquisitionPageId,
  locale: MarketingLocale,
) {
  return PAGES[id][locale];
}
