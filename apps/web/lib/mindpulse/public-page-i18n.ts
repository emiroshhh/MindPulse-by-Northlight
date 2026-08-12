import {
  KAZAKH_PUBLIC_PAGES,
  RUSSIAN_PUBLIC_PAGES,
} from './public-page-translations';

export type PublicPageId = 'privacy' | 'why' | 'beta' | 'case-study' | 'impact';

export type PublicPageCopy = {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; body: string; items?: string[] }>;
  ctaTitle: string;
  ctaBody: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

export type LocalizedPublicPage = Record<
  'en' | 'ru' | 'kk' | 'es',
  PublicPageCopy
>;

const ENGLISH_AND_SPANISH_PUBLIC_PAGES: Record<
  PublicPageId,
  Pick<LocalizedPublicPage, 'en' | 'es'>
> = {
  privacy: {
    en: {
      metadataTitle: 'Privacy',
      metadataDescription:
        'Plain-language privacy information for the MindPulse student beta.',
      eyebrow: 'Plain-language privacy',
      title: 'Privacy for the MindPulse beta',
      intro:
        'MindPulse is an AI student-support beta designed to help with studying, planning, reflection, goals, and consistency — not to collect sensitive personal information.',
      sections: [
        {
          title: 'Guest use',
          body: 'Guest chat history, saved results, recovery plans, and focus state are stored locally in your browser. They are not synced to an account.',
        },
        {
          title: 'Accounts',
          body: 'If you create an account, MindPulse stores your email, a secure password hash, session records, account chat history, saved Agent plans, and recovery plans in Cloudflare D1 so account features can work.',
        },
        {
          title: 'Usage limits',
          body: 'MindPulse stores a daily message count linked to an account or a server-derived guest key. This protects API costs and keeps the beta available. Raw IP addresses are not stored.',
        },
        {
          title: 'AI processing',
          body: 'Messages sent to AI tools pass through the MindPulse server to the configured AI provider to generate a reply. Provider processing and safety handling may apply.',
        },
        {
          title: 'Anonymous feedback',
          body: 'Feedback is optional. MindPulse stores only your answers, an optional short suggestion, interface language, broad device category, and timestamp — never your account, chat content, or IP address.',
        },
        {
          title: 'Aggregate beta measurement',
          body: 'Core flows are counted as anonymous daily totals. These counters contain no user IDs, text, or device identifiers.',
        },
        {
          title: 'Retention',
          body: 'Guest data remains until browser storage is cleared. Account and usage records remain during the beta until removed; no fixed automatic deletion period is currently promised.',
        },
        {
          title: 'Please do not share',
          body: 'Do not enter passwords, financial details, private documents, sensitive personal information, or anything you would not want an AI tool to process. AI can make mistakes, so verify important information.',
        },
        {
          title: 'Deletion and privacy requests',
          body: 'Guests can clear site storage. Logged-in users can permanently delete their account and stored data from the Account section; password confirmation is required and deletion cannot be undone. Use anonymous feedback for privacy questions, but never include passwords, tokens, or private chat content.',
        },
        {
          title: 'What MindPulse is not',
          body: 'MindPulse is not a therapist, doctor, emergency service, or crisis service. If you are in immediate danger, contact local emergency services or a trusted person nearby now.',
        },
      ],
      ctaTitle: 'Ready to use it carefully?',
      ctaBody:
        'Start with study support, planning, habits, goals, or reflection — and keep sensitive details out of the chat.',
      ctaPrimary: 'Start using MindPulse',
      ctaSecondary: 'Try Study Mode',
    },
    es: {
      metadataTitle: 'Privacidad',
      metadataDescription:
        'Información clara sobre la privacidad de la beta de MindPulse para estudiantes.',
      eyebrow: 'Privacidad en lenguaje claro',
      title: 'Privacidad en la beta de MindPulse',
      intro:
        'MindPulse es una beta de apoyo estudiantil con IA. Está diseñada para ayudar a estudiar, planificar, reflexionar, definir metas y ser constante, no para recopilar información personal sensible.',
      sections: [
        {
          title: 'Uso como invitado',
          body: 'El historial de chat, los resultados, los planes de recuperación y el objetivo de hoy se guardan localmente en tu navegador. No se sincronizan con una cuenta.',
        },
        {
          title: 'Cuentas',
          body: 'Si creas una cuenta, MindPulse guarda tu correo, un hash seguro de la contraseña, las sesiones, el historial de chat, los planes del Agente y los planes de recuperación en Cloudflare D1 para ofrecer las funciones de la cuenta.',
        },
        {
          title: 'Límites de uso',
          body: 'MindPulse guarda un contador diario vinculado a una cuenta o a una clave de invitado derivada en el servidor. Esto protege los costos de la API y mantiene disponible la beta. No se guardan direcciones IP sin procesar.',
        },
        {
          title: 'Procesamiento con IA',
          body: 'Los mensajes enviados a las herramientas de IA pasan por el servidor de MindPulse al proveedor configurado para generar una respuesta. Pueden aplicarse el procesamiento del proveedor y las medidas de seguridad.',
        },
        {
          title: 'Comentarios anónimos',
          body: 'Enviar comentarios es opcional. Solo se guardan tus respuestas, una sugerencia breve opcional, el idioma, una categoría general del dispositivo y la fecha; nunca tu cuenta, el chat ni la dirección IP.',
        },
        {
          title: 'Medición agregada de la beta',
          body: 'Los flujos principales se cuentan como totales diarios anónimos. Estos contadores no contienen identificadores de usuario, texto ni identificadores del dispositivo.',
        },
        {
          title: 'Conservación',
          body: 'Los datos de invitado permanecen hasta que borres los datos del sitio. Los registros de cuenta y uso se conservan durante la beta hasta que se eliminen; por ahora no se promete un plazo automático fijo.',
        },
        {
          title: 'No compartas información sensible',
          body: 'No ingreses contraseñas, datos financieros, documentos privados, información personal sensible ni nada que no quieras que procese una herramienta de IA. La IA puede equivocarse: verifica la información importante.',
        },
        {
          title: 'Eliminación y solicitudes de privacidad',
          body: 'Los invitados pueden borrar los datos del sitio. Quienes tienen cuenta pueden eliminar de forma permanente su cuenta y sus datos desde la sección Cuenta; se requiere la contraseña y no se puede deshacer. Usa los comentarios anónimos para consultas de privacidad, sin incluir contraseñas, tokens ni chats privados.',
        },
        {
          title: 'Lo que MindPulse no es',
          body: 'MindPulse no es terapia, atención médica ni un servicio de emergencias o crisis. Si corres peligro inmediato, contacta ahora con los servicios de emergencia de tu zona o con una persona de confianza cercana.',
        },
      ],
      ctaTitle: '¿Quieres usarlo de forma responsable?',
      ctaBody:
        'Empieza con estudio, planificación, hábitos, metas o reflexión y no incluyas datos sensibles en el chat.',
      ctaPrimary: 'Empezar a usar MindPulse',
      ctaSecondary: 'Probar el modo Estudio',
    },
  },
  why: {
    en: {
      metadataTitle: 'Why I built this',
      metadataDescription:
        'The student problem and product principles behind MindPulse.',
      eyebrow: 'The project story',
      title: 'I built MindPulse for the moment before progress starts.',
      intro:
        'Students often know they need to study, plan, or reflect, but the first step can feel like the hardest part. MindPulse is meant to make that step smaller, clearer, and less judgmental.',
      sections: [
        {
          title: 'The problem',
          body: 'School pressure arrives as a pile: unclear assignments, deadlines, tiredness, missed days, and guilt. Generic advice often adds more reading when a student needs one concrete move.',
        },
        {
          title: 'A student-first answer',
          body: 'MindPulse starts with guest access and six focused tools. It gives practical support without pretending to replace teachers, professionals, trusted adults, or emergency services.',
        },
        {
          title: 'What I am trying to build',
          body: 'A calm workspace that turns one real situation into a manageable next action, supports recovery after missed days, and lets students keep useful progress privately.',
        },
        {
          title: 'Product principles',
          body: 'The beta follows a few simple principles.',
          items: [
            'Relief before pressure',
            'One useful action before a perfect plan',
            'Guest access without a login wall',
            'Private account progress',
            'Honest feedback instead of inflated claims',
          ],
        },
        {
          title: 'Still a beta',
          body: 'MindPulse can make mistakes. It is free while it grows, and the product should improve from real student feedback rather than startup noise.',
        },
      ],
      ctaTitle: 'Bring one real task.',
      ctaBody:
        'Choose the tool that fits what is difficult today and start with one honest sentence.',
      ctaPrimary: 'Open MindPulse',
      ctaSecondary: 'Read the case study',
    },
    es: {
      metadataTitle: 'Por qué creé esto',
      metadataDescription:
        'El problema estudiantil y los principios de producto detrás de MindPulse.',
      eyebrow: 'La historia del proyecto',
      title:
        'Creé MindPulse para ese momento justo antes de empezar a avanzar.',
      intro:
        'Los estudiantes suelen saber que necesitan estudiar, planificar o reflexionar, pero el primer paso puede parecer el más difícil. MindPulse busca hacerlo más pequeño, claro y libre de juicios.',
      sections: [
        {
          title: 'El problema',
          body: 'La presión escolar llega como una pila: tareas poco claras, fechas límite, cansancio, días perdidos y culpa. Los consejos genéricos suelen añadir más lectura cuando lo que hace falta es una acción concreta.',
        },
        {
          title: 'Una respuesta pensada para estudiantes',
          body: 'MindPulse empieza con acceso como invitado y seis herramientas específicas. Ofrece apoyo práctico sin pretender sustituir a docentes, profesionales, personas de confianza ni servicios de emergencia.',
        },
        {
          title: 'Lo que intento construir',
          body: 'Un espacio tranquilo que convierta una situación real en una acción manejable, ayude a retomar después de acumular trabajo atrasado y permita guardar el progreso útil de forma privada.',
        },
        {
          title: 'Principios del producto',
          body: 'La beta sigue algunos principios sencillos.',
          items: [
            'Alivio antes que presión',
            'Una acción útil antes que un plan perfecto',
            'Acceso como invitado sin barreras',
            'Progreso privado en la cuenta',
            'Comentarios sinceros en lugar de afirmaciones infladas',
          ],
        },
        {
          title: 'Sigue siendo una beta',
          body: 'MindPulse puede equivocarse. Es gratuito mientras crece y debe mejorar con experiencias reales de estudiantes, no con ruido publicitario.',
        },
      ],
      ctaTitle: 'Trae una tarea real.',
      ctaBody:
        'Elige la herramienta que corresponda a lo que te cuesta hoy y empieza con una frase sincera.',
      ctaPrimary: 'Abrir MindPulse',
      ctaSecondary: 'Leer el caso de estudio',
    },
  },
  beta: {
    en: {
      metadataTitle: 'Beta testing',
      metadataDescription:
        'A practical guide to testing the free MindPulse student beta.',
      eyebrow: 'Student beta',
      title: 'Try one tool on one real task.',
      intro:
        'A useful beta test takes only a few minutes. Honest feedback about what helped, felt unclear, or was missing matters more than trying every feature.',
      sections: [
        {
          title: 'What it helps with',
          body: 'MindPulse supports studying, realistic planning, motivation resets, habits, goals, reflection, and a guided restart after missed days.',
        },
        {
          title: 'What it does not do',
          body: 'It does not replace a teacher, therapist, doctor, emergency service, or final source of truth. Verify important information and keep sensitive details out of prompts.',
        },
        {
          title: 'A four-step test',
          body: 'Use the beta on something that matters today.',
          items: [
            'Try one tool — choose the mode that matches your need',
            'Use one real task — bring a topic, deadline, habit, goal, or reflection',
            'Send feedback — share what helped, what was unclear, and what you expected',
            'Share if useful — invite another student only if it genuinely helped',
          ],
        },
        {
          title: 'Choose one of six tools',
          body: 'Study Help, Daily Planner, Motivation Reset, Habit Coach, Goal Breakdown, and Quick Reflection share the same limits, language choice, privacy rules, and safety system.',
        },
        {
          title: 'Privacy-conscious feedback',
          body: 'The feedback form is anonymous and is not linked to your account or chat. Do not paste private chat content into it.',
        },
      ],
      ctaTitle: 'Come back with one task.',
      ctaBody:
        'The best test is a real task and one concrete note about the result.',
      ctaPrimary: 'Start a beta test',
      ctaSecondary: 'Read privacy details',
    },
    es: {
      metadataTitle: 'Prueba beta',
      metadataDescription:
        'Guía práctica para probar la beta gratuita de MindPulse para estudiantes.',
      eyebrow: 'Beta para estudiantes',
      title: 'Prueba una herramienta con una tarea real.',
      intro:
        'Una prueba útil solo toma unos minutos. Los comentarios sinceros sobre qué ayudó, no quedó claro o faltó importan más que probar cada función.',
      sections: [
        {
          title: 'En qué puede ayudarte',
          body: 'MindPulse ayuda con el estudio, la planificación realista, la motivación, los hábitos, las metas, la reflexión y el reinicio guiado después de acumular trabajo atrasado.',
        },
        {
          title: 'Lo que no hace',
          body: 'No sustituye a docentes, terapeutas, médicos, servicios de emergencia ni fuentes definitivas. Verifica la información importante y no incluyas datos sensibles en los mensajes.',
        },
        {
          title: 'Una prueba en cuatro pasos',
          body: 'Usa la beta con algo que te importe hoy.',
          items: [
            'Elige una herramienta que corresponda a lo que necesitas',
            'Usa un tema, fecha límite, hábito, meta o reflexión reales',
            'Cuenta qué ayudó, qué no quedó claro y qué esperabas',
            'Invita a otro estudiante solo si de verdad te sirvió',
          ],
        },
        {
          title: 'Seis herramientas específicas',
          body: 'Ayuda de estudio, Planificador diario, Reinicio de motivación, Guía de hábitos, División de metas y Reflexión rápida comparten los mismos límites, idioma, reglas de privacidad y sistema de seguridad.',
        },
        {
          title: 'Comentarios que respetan tu privacidad',
          body: 'El formulario es anónimo y no se vincula con tu cuenta ni con el chat. No pegues contenido privado de tus conversaciones.',
        },
      ],
      ctaTitle: 'Vuelve con una tarea.',
      ctaBody:
        'La mejor prueba usa una tarea real y un comentario concreto sobre el resultado.',
      ctaPrimary: 'Empezar una prueba beta',
      ctaSecondary: 'Leer sobre privacidad',
    },
  },
  'case-study': {
    en: {
      metadataTitle: 'Case study',
      metadataDescription:
        'MindPulse product, safety, privacy, and technical architecture case study.',
      eyebrow: 'Product case study',
      title: 'A guest-first AI workspace built for real student friction.',
      intro:
        'MindPulse combines focused AI tools, a small-action dashboard, safety screening, private accounts, and honest beta measurement in one accessible student product.',
      sections: [
        {
          title: 'Problem and users',
          body: 'Students dealing with unclear work, limited energy, and missed days need a concrete starting point, not another complicated productivity system.',
        },
        {
          title: 'Product idea',
          body: 'One primary next action, six focused tools, an AI Agent, and Recovery Mode turn messy input into a realistic step while preserving guest access.',
        },
        {
          title: 'AI design choices',
          body: 'Server-only routes assemble mode instructions and call the configured provider without exposing keys. Recovery output uses a strict schema, one repair attempt, and a deterministic fallback made only from the student’s items.',
        },
        {
          title: 'Six focused AI tools',
          body: 'Study Help, Daily Planner, Motivation Reset, Habit Coach, Goal Breakdown, and Quick Reflection each provide guided intake and mode-specific instructions.',
        },
        {
          title: 'Safety and privacy',
          body: 'Input is screened before generation and model output before display. Crisis content receives localized support. Account secrets remain server-side; anonymous feedback and aggregate beta counters avoid user identifiers.',
        },
        {
          title: 'Technical architecture',
          body: 'Next.js and React provide the interface. OpenNext targets Cloudflare Workers. D1 stores account data, hashed sessions, usage counters, chat history, plans, anonymous feedback, aggregate events, and durable rate limits.',
        },
        {
          title: 'What has been built',
          body: 'The verified beta includes:',
          items: [
            'Guest-first local state and private accounts',
            'One-action dashboard and guided onboarding',
            'Six AI tools plus Agent and Recovery Mode',
            'Deterministic safety screening and localized crisis replies',
            'English, Russian, Kazakh (beta), and Spanish interfaces',
            'Password-confirmed account deletion',
            'Anonymous feedback and aggregate-only measurement',
          ],
        },
        {
          title: 'What will be measured next',
          body: 'Evidence should come from real use, not invented impact.',
          items: [
            'Students completing at least one real task',
            'Concrete improvement suggestions',
            'Returning beta testers',
            'Most useful tools',
            'Reported clarity or a more manageable next step',
          ],
        },
        {
          title: 'Beta testing flow',
          body: 'A tester chooses one tool, uses one real task, completes a useful action when possible, and sends a short anonymous comment without copying private chat content.',
        },
        {
          title: 'Roadmap',
          body: 'The roadmap is evidence-led: improve weak flows, review translation and safety quality with native speakers, strengthen accessibility, and expand only after real beta feedback supports it.',
        },
      ],
      ctaTitle: 'Test the actual product.',
      ctaBody:
        'Use one tool on one real task, then share a privacy-conscious comment.',
      ctaPrimary: 'Open MindPulse',
      ctaSecondary: 'See beta guide',
    },
    es: {
      metadataTitle: 'Caso de estudio',
      metadataDescription:
        'Caso de estudio sobre el producto, la seguridad, la privacidad y la arquitectura de MindPulse.',
      eyebrow: 'Caso de estudio del producto',
      title:
        'Un espacio de IA con acceso como invitado, creado para dificultades estudiantiles reales.',
      intro:
        'MindPulse combina herramientas de IA específicas, un panel centrado en una acción pequeña, filtros de seguridad, cuentas privadas y medición honesta de la beta.',
      sections: [
        {
          title: 'Problema y usuarios',
          body: 'Los estudiantes que enfrentan tareas poco claras, poca energía y trabajo atrasado necesitan un punto de partida concreto, no otro sistema de productividad complicado.',
        },
        {
          title: 'Idea del producto',
          body: 'Una acción principal, seis herramientas, un Agente de IA y el Modo Recuperación convierten información desordenada en un paso realista sin bloquear el acceso como invitado.',
        },
        {
          title: 'Decisiones de diseño de IA',
          body: 'Las rutas del servidor crean instrucciones por modo y llaman al proveedor configurado sin exponer claves. Recuperación exige un esquema estricto, intenta una reparación y usa un plan determinista creado solo con las tareas del estudiante.',
        },
        {
          title: 'Seis herramientas de IA específicas',
          body: 'Ayuda de estudio, Planificador diario, Reinicio de motivación, Guía de hábitos, División de metas y Reflexión rápida ofrecen entradas guiadas e instrucciones específicas.',
        },
        {
          title: 'Seguridad y privacidad',
          body: 'La entrada se revisa antes de generar y la salida antes de mostrarse. El contenido de crisis recibe apoyo localizado. Los secretos permanecen en el servidor; los comentarios anónimos y los contadores agregados evitan identificadores.',
        },
        {
          title: 'Arquitectura técnica',
          body: 'Next.js y React ofrecen la interfaz. OpenNext prepara la aplicación para Cloudflare Workers. D1 guarda datos de cuenta, sesiones con hash, contadores de uso, chats, planes, comentarios anónimos, eventos agregados y límites de frecuencia persistentes.',
        },
        {
          title: 'Lo que ya está construido',
          body: 'La beta verificada incluye:',
          items: [
            'Estado local para invitados y cuentas privadas',
            'Panel de una acción e inicio guiado',
            'Seis herramientas de IA, Agente y Modo Recuperación',
            'Filtros deterministas y respuestas de crisis localizadas',
            'Interfaces en inglés, ruso, kazajo (beta) y español',
            'Eliminación de cuenta confirmada con contraseña',
            'Comentarios anónimos y medición solo agregada',
          ],
        },
        {
          title: 'Qué se medirá después',
          body: 'La evidencia debe provenir del uso real, no de un impacto inventado.',
          items: [
            'Estudiantes que completan al menos una tarea real',
            'Sugerencias concretas de mejora',
            'Personas que vuelven a la beta',
            'Herramientas más útiles',
            'Mayor claridad o un siguiente paso más manejable',
          ],
        },
        {
          title: 'Flujo de prueba beta',
          body: 'La persona elige una herramienta, usa una tarea real, completa una acción útil cuando sea posible y envía un comentario anónimo breve sin copiar contenido privado del chat.',
        },
        {
          title: 'Hoja de ruta',
          body: 'La hoja de ruta se guía por evidencia: mejorar los flujos débiles, revisar traducción y seguridad con hablantes nativos, reforzar la accesibilidad y ampliar solo cuando los comentarios reales lo respalden.',
        },
      ],
      ctaTitle: 'Prueba el producto real.',
      ctaBody:
        'Usa una herramienta con una tarea real y envía un comentario que cuide tu privacidad.',
      ctaPrimary: 'Abrir MindPulse',
      ctaSecondary: 'Ver la guía beta',
    },
  },
  impact: {
    en: {
      metadataTitle: 'Impact',
      metadataDescription:
        'Honest beta goals and impact measurement for MindPulse.',
      eyebrow: 'Impact, without inflated claims',
      title: 'Measure whether students actually move forward.',
      intro:
        'MindPulse is an early beta. It does not claim outcomes it has not measured. The current goal is to learn whether the product helps students find a clearer, more manageable next step.',
      sections: [
        {
          title: 'The problem',
          body: 'Overwhelm, procrastination, unclear priorities, and missed days can make the first useful action hard to see.',
        },
        {
          title: 'The proposed solution',
          body: 'A guest-first workspace with focused tools, Recovery Mode, and one-action guidance may reduce friction without adding shame or an elaborate setup.',
        },
        {
          title: 'Current beta goals',
          body: 'These are learning targets, not claimed achievements.',
          items: [
            '50 student users',
            '20 feedback responses',
            '500+ AI sessions or messages',
            'Improve the product based on feedback',
          ],
        },
        {
          title: 'Future measures',
          body: 'If enough people use the beta, meaningful measures include:',
          items: [
            'Students reached',
            'AI sessions completed',
            'Feedback responses',
            'Returning users',
            'Percentage reporting better planning or a clearer next step',
          ],
        },
        {
          title: 'Privacy boundary',
          body: 'Impact measurement uses aggregate event totals and anonymous feedback. It does not require raw prompts, chat text, IP addresses, or analytics identifiers.',
        },
      ],
      ctaTitle: 'Help create honest evidence.',
      ctaBody:
        'Use MindPulse for one real task and share a short anonymous comment about the result.',
      ctaPrimary: 'Try MindPulse',
      ctaSecondary: 'How to beta test',
    },
    es: {
      metadataTitle: 'Impacto',
      metadataDescription:
        'Metas honestas de la beta y medición del impacto de MindPulse.',
      eyebrow: 'Impacto sin afirmaciones infladas',
      title: 'Medir si los estudiantes realmente logran avanzar.',
      intro:
        'MindPulse es una beta temprana. No afirma resultados que aún no ha medido. La meta actual es saber si ayuda a encontrar un siguiente paso más claro y manejable.',
      sections: [
        {
          title: 'El problema',
          body: 'El agobio, la postergación, las prioridades poco claras y el trabajo atrasado pueden ocultar la primera acción útil.',
        },
        {
          title: 'La solución propuesta',
          body: 'Un espacio accesible como invitado, con herramientas específicas, Modo Recuperación y orientación centrada en una acción, puede reducir la fricción sin añadir culpa ni una configuración compleja.',
        },
        {
          title: 'Metas actuales de la beta',
          body: 'Son objetivos de aprendizaje, no logros afirmados.',
          items: [
            '50 estudiantes',
            '20 comentarios recibidos',
            'Más de 500 sesiones o mensajes de IA',
            'Mejorar el producto a partir de los comentarios',
          ],
        },
        {
          title: 'Mediciones futuras',
          body: 'Si suficientes personas usan la beta, las mediciones útiles incluyen:',
          items: [
            'Estudiantes alcanzados',
            'Sesiones de IA realizadas',
            'Comentarios recibidos',
            'Personas que vuelven',
            'Porcentaje que informa una mejor planificación o un siguiente paso más claro',
          ],
        },
        {
          title: 'Límite de privacidad',
          body: 'La medición usa totales agregados de eventos y comentarios anónimos. No necesita mensajes sin procesar, texto de chat, direcciones IP ni identificadores de análisis.',
        },
      ],
      ctaTitle: 'Ayuda a crear evidencia honesta.',
      ctaBody:
        'Usa MindPulse con una tarea real y comparte un comentario anónimo breve sobre el resultado.',
      ctaPrimary: 'Probar MindPulse',
      ctaSecondary: 'Cómo probar la beta',
    },
  },
};

export const PUBLIC_PAGES: Record<PublicPageId, LocalizedPublicPage> =
  Object.fromEntries(
    (Object.keys(ENGLISH_AND_SPANISH_PUBLIC_PAGES) as PublicPageId[]).map(
      (page) => [
        page,
        {
          ...ENGLISH_AND_SPANISH_PUBLIC_PAGES[page],
          ru: RUSSIAN_PUBLIC_PAGES[page],
          kk: KAZAKH_PUBLIC_PAGES[page],
        },
      ],
    ),
  ) as Record<PublicPageId, LocalizedPublicPage>;

export function publicPageCopyFor(id: PublicPageId, language: string) {
  return (
    PUBLIC_PAGES[id][language as keyof LocalizedPublicPage] ??
    PUBLIC_PAGES[id].en
  );
}
