import type { UiCopy } from './i18n';
import type { MindPulseTool } from './tools';

/** Complete, first-class Spanish product copy. */
export const ES: UiCopy = {
  navDashboard: 'Panel',
  navWhy: 'Por qué creé esto',
  navAgent: 'Agente',
  navLogin: 'Iniciar sesión',
  navLogout: 'Cerrar sesión',
  navSignup: 'Crear cuenta',
  guestBannerText:
    'Crea una cuenta gratuita para enviar más mensajes y guardar tu progreso. El historial como invitado permanece en este dispositivo.',
  guestBannerCreate: 'Crear cuenta gratuita',
  guestBannerLogin: 'Iniciar sesión',
  guestBannerContinue: 'Continuar como invitado',
  heroBeta: 'Beta',
  heroBuiltBy: 'Creado por un estudiante, para estudiantes',
  heroTitle: 'Un espacio más tranquilo para los días complicados.',
  heroSubtitle:
    'MindPulse te ayuda a estudiar, planificar, recuperar la motivación, crear hábitos, dividir metas y reflexionar sin culpa. Empieza como invitado o crea una cuenta gratuita cuando quieras guardar tu progreso.',
  heroOpenChat: 'Abrir chat con IA',
  heroWhy: 'Por qué creé esto',
  onboardingLabel: 'Empieza aquí',
  onboardingTitle: 'Obtén algo útil en menos de un minuto.',
  onboardingIntro:
    'MindPulse funciona mejor cuando eliges una herramienta, describes la situación real y conviertes la respuesta en una sola acción siguiente.',
  onboardingSteps: [
    [
      'Elige una herramienta',
      'Elige Estudio, Planificador, Motivación, Hábitos, Metas o Reflexión según lo que necesites.',
    ],
    [
      'Pide ayuda con claridad',
      'Menciona la fecha límite, tu nivel de energía y el tipo de ayuda que buscas.',
    ],
    [
      'Pasa a la acción',
      'Guarda el siguiente paso como tu objetivo de hoy y empieza con algo pequeño.',
    ],
  ],
  onboardingPromptTitle: 'Un buen primer mensaje puede ser:',
  onboardingPromptExamples: [
    'Tengo 90 minutos, poca energía y mañana rindo un examen de matemáticas. Crea un plan realista.',
    'No entiendo este tema. Explícamelo de forma sencilla y luego hazme cinco preguntas.',
  ],
  commandLabel: 'Centro de control',
  commandTitle: 'Un solo lugar para estudiar, planificar y avanzar.',
  commandDesc:
    'Define tu objetivo de hoy, elige una herramienta, conversa con MindPulse o pide al Agente que convierta una situación confusa en un plan claro.',
  focusTitle: 'Objetivo de hoy',
  focusPlaceholder: 'Una cosa útil para hoy…',
  focusNote:
    'Sin rachas que generen culpa ni vergüenza. Elige una cosa útil para hoy; lo demás será más fácil después.',
  planGuestLabel: 'Plan de invitado',
  planAccountLabel: 'Plan con cuenta',
  planGuestDesc:
    '5 mensajes gratuitos al día · historial solo en este dispositivo',
  planAccountDesc: '20 mensajes gratuitos al día · historial de chat guardado',
  featureCards: [
    ['Beta gratuita para estudiantes', 'Sin pagos, suscripciones ni anuncios.'],
    ['Primero como invitado', 'Prueba MindPulse sin tener que iniciar sesión.'],
    [
      'Privacidad desde el diseño',
      'Las claves de API y los datos de la cuenta permanecen en el servidor.',
    ],
  ],
  toolsLabel: 'Seis herramientas',
  toolsTitle: 'Elige el tipo de apoyo que necesitas.',
  toolsDesc:
    'Cada herramienta abre un modo de chat específico con ejemplos y conserva los mismos límites y el idioma elegido.',
  toolOpenLabel: 'Abrir herramienta →',
  agentLabel: 'Agente de IA',
  agentTitle: 'Convierte la presión difusa en un plan.',
  agentSubtitle:
    'Úsalo cuando no necesites una conversación larga, sino un plan claro, acciones siguientes y un primer paso pequeño.',
  agentPrompts: [
    'Convierte mi ansiedad por el examen en un plan de estudio de 3 días',
    'Divide mi proyecto semestral en acciones siguientes',
    'Sigo postergando. Dame el primer paso más pequeño',
  ],
  agentPlaceholder: 'Tengo un examen de biología el viernes y voy atrasado…',
  agentGenerate: 'Generar siguiente paso',
  agentOutputTitle: 'Resultado estructurado',
  agentOutputEmpty:
    'Aquí aparecerán la meta, el plan, las próximas 3 acciones, la fecha límite, el reinicio de motivación, los obstáculos y el primer paso más pequeño.',
  agentSave: 'Guardar plan',
  agentSavedLocal: 'Guardado en este dispositivo.',
  agentFallback:
    'El Agente de MindPulse no pudo generar un plan en este momento.',
  recentTitle: 'Sesiones recientes',
  recentGuest:
    'Las conversaciones como invitado permanecen en este navegador. Abre el chat para continuar tu sesión local.',
  recentAccount:
    'Tus conversaciones recientes aparecen en el panel de chat y se guardan en tu cuenta.',
  nextActionsTitle: 'Qué puedes probar ahora',
  nextActions: [
    [
      'Planifica tu día',
      'Usa el Planificador si tus tareas están desordenadas.',
      '/planner',
    ],
    [
      'Estudia un tema',
      'Usa Estudio cuando un concepto no esté claro.',
      '/study',
    ],
    [
      'Recupera el impulso',
      'Usa Motivación cuando te cueste empezar.',
      '/motivation',
    ],
  ],
  betaJourneyLabel: 'Recorrido de prueba beta',
  betaJourneyTitle: 'Prueba MindPulse con una tarea estudiantil real.',
  betaJourneyDesc:
    'Una prueba útil solo toma unos minutos. Tus comentarios sinceros importan más que probar cada función.',
  betaJourneySteps: [
    [
      'Prueba una herramienta',
      'Elige el modo que corresponda a lo que necesitas hoy.',
    ],
    [
      'Usa una tarea real',
      'Trae una fecha límite, tema, plan, hábito o meta reales.',
    ],
    [
      'Envía tus comentarios',
      'Cuéntanos qué ayudó, qué no quedó claro y qué faltó.',
    ],
    [
      'Compártelo si te sirve',
      'Si de verdad te ayudó, invita a otro estudiante a probarlo.',
    ],
  ],
  retentionTitle: 'Un ritmo sencillo que funciona',
  retentionItems: [
    'Usa el Planificador antes de una sesión de estudio.',
    'Guarda una sola acción pequeña para hoy.',
    'Usa Reflexión al final del día.',
    'Vuelve mañana con una tarea real.',
  ],
  footerDashboard: 'Panel',
  footerWhy: 'Por qué creé esto',
  footerBeta: 'Prueba beta',
  footerCaseStudy: 'Caso de estudio',
  footerImpact: 'Impacto',
  footerPrivacy: 'Privacidad',
  footerFeedback: 'Comentarios',
  footerNote:
    'MindPulse no es terapia ni un servicio de emergencias. La IA puede equivocarse. Verifica siempre la información importante.',
  toolPageBack: 'Volver al panel',
  toolPageBeta: 'Beta gratuita para estudiantes',
  toolPageGuestAccess: 'Acceso como invitado',
  toolPageAccountAccess: 'Acceso con cuenta',
  toolPageGuestSlogan: 'Pruébalo sin iniciar sesión.',
  toolPageAccountSlogan: 'Sincronizado con tu cuenta.',
  toolPageGuestDesc:
    'El chat permanece en este dispositivo e incluye 5 mensajes gratuitos al día.',
  toolPageAccountDesc:
    'Tu cuenta incluye 20 mensajes gratuitos al día y guarda el historial de chat.',
  toolPageCreate: 'Crear cuenta',
  toolPageLogin: 'Iniciar sesión',
  toolPageBestFor: 'Ideal para',
  toolPagePromptStarters: 'Ideas para empezar',
  toolPageHowToUse: 'Cómo usar este modo',
  toolPageFeedbackLabel: 'Después de una tarea real',
  toolPageFeedbackTitle: '¿Esta herramienta te ayudó a avanzar?',
  toolPageFeedbackDesc:
    'Envía un comentario breve sobre lo que funcionó o no quedó claro. Nunca incluyas contenido privado del chat.',
  feedback: {
    label: 'Enviar comentarios',
    eyebrow: 'Comentarios sobre la beta',
    title: 'Ayuda a mejorar MindPulse',
    intro:
      'Toma un minuto y es anónimo. No incluyas chats privados, contraseñas ni datos personales.',
    flowLabel: '¿Sobre qué parte quieres comentar?',
    flowOptions: {
      landing: 'Página de inicio',
      dashboard: 'Panel',
      study: 'Ayuda de estudio',
      planner: 'Planificador diario',
      motivation: 'Reinicio de motivación',
      habits: 'Guía de hábitos',
      goals: 'División de metas',
      reflection: 'Reflexión rápida',
      recovery: 'Modo Recuperación',
      beta: 'Prueba beta en general',
      other: 'Otra cosa',
    },
    helpedLabel: '¿Te ayudó a avanzar?',
    confusingLabel: '¿Algo te resultó confuso?',
    expectationLabel: '¿Cumplió tus expectativas?',
    yes: 'Sí',
    no: 'No',
    skip: 'Omitir',
    suggestionLabel: '¿Qué mejorarías? (opcional)',
    suggestionPlaceholder: 'Sugerencia breve, máximo 500 caracteres…',
    consentLabel:
      'Compartir de forma anónima para mejorar MindPulse. No se adjuntan datos de cuenta, del chat ni personales.',
    privacyNote:
      'Se guardan tus respuestas, el idioma de la interfaz, la categoría de tamaño del dispositivo y la fecha. Nada más.',
    send: 'Enviar comentarios',
    sending: 'Enviando…',
    thanksTitle: 'Gracias, de verdad.',
    thanksCopy:
      'Tus comentarios anónimos se guardaron y ayudarán a decidir qué mejorar primero.',
    errorCopy:
      'No pudimos enviar tus comentarios. Inténtalo de nuevo más tarde.',
    rateLimited: 'Ya enviaste varios comentarios hoy. ¡Gracias! Vuelve mañana.',
    close: 'Cerrar comentarios',
  },
  authChecking: 'Comprobando tu sesión…',
  agentNeedLogin: 'Inicia sesión para guardar el plan en tu cuenta.',
  nextAction: {
    eyebrow: '¿Qué debería hacer ahora?',
    currentTitle: 'Tu siguiente acción',
    doneButton: 'Listo',
    changeButton: 'Elegir otra',
    localNote: 'Guardado solo en este dispositivo.',
    quickStartTitle: 'Obtén una siguiente acción clara',
    quickStartIntro:
      'Elige qué necesitas, describe una tarea o dificultad real y MindPulse te sugerirá el paso útil más pequeño.',
    needLabel: '¿Qué necesitas ahora?',
    taskLabel: 'Una tarea, meta o dificultad real',
    taskPlaceholder: 'Ej.: El ensayo vence el viernes y aún no empecé…',
    requestPrompt: (task) =>
      `Sugiere exactamente UNA acción siguiente pequeña y concreta (1–2 frases, que pueda empezar en los próximos 15 minutos) para esta situación. Sin listas ni planes; solo el paso útil más pequeño: ${task}`,
    submit: 'Sugerir mi siguiente acción',
    loading: 'Buscando el paso útil más pequeño…',
    error: 'No pudimos obtener una sugerencia. Inténtalo de nuevo.',
    limitGuest:
      'Alcanzaste el límite gratuito de hoy como invitado. Crea una cuenta gratuita para continuar.',
    limitAccount: 'Alcanzaste el límite gratuito de hoy. Vuelve mañana.',
    resultLabel: 'Siguiente acción sugerida',
    setAsNext: 'Usar como mi siguiente acción',
    tryAgain: 'Probar otra',
    recoveryOption: 'Me atrasé y necesito retomar',
    recoveryHint: 'Abre el Modo Recuperación: un reinicio guiado, no un chat.',
    doneCelebration: 'Bien. Un paso real vale más que un plan perfecto.',
  },
  insights: {
    title: 'Tu actividad',
    empty:
      'Todavía no hay suficiente actividad para mostrar. Es normal el primer día.',
    activeDays: 'días con actividad',
    messagesToday: 'mensajes de IA hoy',
    savedResults: 'resultados guardados',
    recoveryPlans: 'planes de recuperación',
    localNote:
      'Basado únicamente en la actividad guardada en este dispositivo.',
    accountNote: 'Basado únicamente en la actividad guardada en tu cuenta.',
  },
  recoveryCard: {
    title: '¿Te atrasaste unos días?',
    copy: 'El Modo Recuperación convierte lo pendiente en un reinicio más pequeño y realista, con una acción inmediata. Sin culpa.',
    cta: 'Abrir Modo Recuperación',
  },
  account: {
    title: 'Cuenta',
    signedInAs: 'Sesión iniciada como',
    deleteButton: 'Eliminar cuenta y datos',
    deleteTitle: '¿Quieres eliminar tu cuenta?',
    deleteWarning:
      'Esto elimina de forma permanente tu cuenta, el historial de chat, los planes guardados y los registros de uso. No se puede deshacer. Los datos guardados en este dispositivo permanecerán aquí hasta que borres los datos del navegador.',
    passwordLabel: 'Confirma con tu contraseña',
    confirmDelete: 'Eliminar permanentemente',
    cancel: 'Cancelar',
    deleting: 'Eliminando…',
    wrongPassword: 'La contraseña es incorrecta.',
    deleteFailed: 'No pudimos eliminar la cuenta. Inténtalo de nuevo.',
    rateLimited: 'Demasiados intentos hoy. Inténtalo de nuevo mañana.',
    deleted: 'Tu cuenta y los datos guardados se eliminaron.',
  },
  recovery: {
    eyebrow: 'Modo Recuperación',
    title: '¿Te atrasaste? Retoma con algo más pequeño.',
    intro:
      'Tres pasos breves: explica qué quedó pendiente, enumera tus tareas y recibe un plan realista con una sola acción siguiente. Sin culpa ni sermones.',
    stepLabel: (step, total) => `Paso ${step} de ${total}`,
    step1Title: '¿Qué tarea se quedó pendiente?',
    step1Placeholder:
      'Ej.: No repasé durante tres días y el borrador de un ensayo está atrasado…',
    step1Note:
      'Basta con palabras sencillas. No es una confesión: es información para crear el plan.',
    step2Title: '¿Qué tienes pendiente?',
    step2Note:
      'Agrega hasta 8 tareas. Marca una fecha como fija solo si no se puede cambiar, como un examen o el cierre de una entrega.',
    itemTitleLabel: 'Tarea',
    itemTitlePlaceholder: 'Ej.: Borrador del ensayo de historia',
    itemDeadlineLabel: 'Fecha límite (opcional)',
    itemDeadlinePlaceholder: 'Ej.: viernes / 21 de junio',
    itemFixedLabel: 'Fija: no se puede cambiar',
    addItem: 'Agregar otra tarea',
    removeItem: 'Eliminar',
    step3Title: '¿Qué es realista para hoy?',
    hoursLabel: 'Horas que realmente puedes dedicar hoy (opcional)',
    hoursPlaceholder: 'Ej.: 2',
    energyLabel: 'Tu energía ahora',
    energyLow: 'Baja: que sea muy breve',
    energyOk: 'Bien: ritmo normal',
    back: 'Atrás',
    next: 'Siguiente',
    generate: 'Crear mi plan de recuperación',
    generating: 'Creando un plan realista…',
    errorGeneric: 'No pudimos crear el plan. Inténtalo de nuevo.',
    limitReachedGuest:
      'Alcanzaste el límite gratuito de hoy como invitado. Crea una cuenta gratuita para continuar.',
    limitReachedAccount:
      'Alcanzaste el límite gratuito de tu cuenta por hoy. Vuelve mañana.',
    planTitle: 'Tu plan actualizado',
    fallbackNote:
      'La IA no estaba disponible, así que creamos este plan directamente a partir de tu lista: primero las fechas fijas y con menos carga. No contiene tareas inventadas.',
    immediateTitle: 'Haz esto primero (10 minutos)',
    immediateDoneButton: 'Ya hice el primer paso',
    urgentTitle: 'Urgente: primero las fechas límite',
    optionalTitle: 'Puede esperar',
    droppedTitle: 'Pospuesto a propósito',
    completedTitle: 'Ya retomaste.',
    completedCopy:
      'Hiciste la parte más difícil: volver a empezar. El resto del plan está guardado para cuando estés listo.',
    startOver: 'Crear otro plan de recuperación',
    savedAccount: 'Guardado en tu cuenta.',
    savedLocal: 'Guardado en este dispositivo (modo invitado).',
    validationItems: 'Agrega al menos una tarea con nombre.',
    validationContext: 'Escribe una o dos frases sobre lo que quedó pendiente.',
  },
};

export const ES_CHAT = {
  chooseMode: 'Elige un modo',
  emptyGuest:
    'Tu conversación como invitado aparecerá aquí y permanecerá en este navegador.',
  emptyAuth: 'Tu historial de conversaciones guardadas aparecerá aquí.',
  guestLimitLabel: '5 mensajes gratuitos al día como invitado',
  accountLimitLabel: '20 mensajes gratuitos al día',
  usageRemaining: (remaining: number) =>
    remaining === 1 ? 'Te queda 1 hoy' : `Te quedan ${remaining} hoy`,
  guestLimitReached:
    'Alcanzaste el límite gratuito de hoy como invitado. Crea una cuenta gratuita para continuar y guardar tu progreso.',
  accountLimitReached:
    'Alcanzaste el límite gratuito de tu cuenta por hoy. Vuelve mañana.',
  signup: 'Crear cuenta gratuita',
  login: 'Iniciar sesión',
  send: 'Enviar',
  safetyNote:
    'MindPulse ofrece apoyo práctico, no respuestas perfectas. Verifica siempre la información importante.',
  fallbackError:
    'MindPulse no pudo responder en este momento. Inténtalo de nuevo.',
  loading: 'MindPulse está preparando tus siguientes pasos…',
  authChecking: 'Comprobando tu sesión…',
  crisisResourcesLabel: 'Opciones de apoyo',
  intakeTitle: 'Inicio guiado',
  intakeStart: 'Obtener mi primera respuesta',
  intakeSkip: 'O escribe un mensaje abajo',
  saveResult: 'Guardar este resultado',
  resultSavedAccount: 'Guardado en tu cuenta ✓',
  resultSavedLocal: 'Guardado en este dispositivo ✓',
  saveFailed: 'No se pudo guardar. Inténtalo de nuevo.',
};

export const ES_TOOLS: MindPulseTool[] = [
  {
    id: 'study',
    route: '/study',
    iconId: 'book',
    title: 'Ayuda de estudio',
    shortTitle: 'Estudio',
    headline: 'Comprende más rápido y recuerda por más tiempo.',
    copy: 'Aclara temas, crea ejemplos y practica mejor.',
    explanation:
      'Úsalo cuando un tema no esté claro y quieras una explicación tranquila, un ejemplo sencillo o preguntas para practicar.',
    outcome:
      'Obtendrás mejores resultados si compartes la materia, la fecha límite y qué parte te resulta difícil.',
    bestFor: ['Preparar exámenes', 'Temas difíciles', 'Planes de estudio'],
    emptyHint:
      'Empieza con el tema, tu nivel actual y qué necesitas: una explicación, preguntas, un resumen o un plan.',
    examples: [
      'Tengo un examen de biología en 3 días. Crea un plan con repaso activo y preguntas de práctica.',
      'Explícame las funciones cuadráticas paso a paso y luego hazme 5 preguntas.',
      'Convierte estas notas en una guía de una página con términos clave y errores que debo evitar.',
    ],
    intake: [
      {
        id: 'subject',
        label: 'Materia o tema',
        placeholder: 'Ej.: Funciones cuadráticas',
        maxLength: 120,
      },
      {
        id: 'deadline',
        label: 'Examen o fecha límite (opcional)',
        placeholder: 'Ej.: viernes',
        maxLength: 60,
      },
      {
        id: 'struggle',
        label: '¿Qué parte te resulta difícil?',
        placeholder: 'Ej.: Confundo los pasos de la fórmula…',
        multiline: true,
        maxLength: 300,
      },
    ],
  },
  {
    id: 'planner',
    route: '/planner',
    iconId: 'calendar',
    title: 'Planificador diario',
    shortTitle: 'Planificador',
    headline: 'Convierte un día caótico en un plan realista.',
    copy: 'Organiza un día caótico en bloques de tiempo realistas.',
    explanation:
      'Úsalo cuando tus tareas estén desordenadas y necesites un plan que respete tu energía, tus fechas límite y tus descansos.',
    outcome:
      'Comparte tus tareas, el tiempo disponible y lo que no puedes mover para organizar el día sin exigencias irreales.',
    bestFor: ['Planes diarios', 'Planificación semanal', 'Ordenar prioridades'],
    emptyHint:
      'Enumera tareas, fechas límite, tiempo disponible y energía. MindPulse las convertirá en acciones siguientes.',
    examples: [
      'Planifica mi día de 16:00 a 22:00 con tareas, cena y un descanso de verdad.',
      'Ordena estas tareas por urgencia e importancia y dime qué hacer primero: matemáticas, ensayo, tarjetas y lavar ropa.',
      'Crea un plan semanal para exámenes que deje espacio para descansar y para tareas imprevistas.',
    ],
    intake: [
      {
        id: 'tasks',
        label: 'Tareas pendientes',
        placeholder: 'Ej.: Matemáticas, borrador del ensayo, tarjetas…',
        multiline: true,
        maxLength: 300,
      },
      {
        id: 'time',
        label: 'Tiempo que realmente tienes',
        placeholder: 'Ej.: de 16:00 a 21:00, con la cena en medio',
        maxLength: 120,
      },
    ],
  },
  {
    id: 'motivation',
    route: '/motivation',
    iconId: 'zap',
    title: 'Reinicio de motivación',
    shortTitle: 'Motivación',
    headline: 'Desbloquéate sin castigarte.',
    copy: 'Encuentra el siguiente paso útil más pequeño cuando no puedas avanzar.',
    explanation:
      'Úsalo cuando estés postergando, cansado o abrumado y necesites retomar con calma, no con presión.',
    outcome:
      'Cuenta qué estás evitando y cuánta energía tienes. MindPulse te ayudará a retomar con un paso pequeño.',
    bestFor: [
      'Volver a empezar',
      'Recuperar confianza',
      'Constancia sin culpa',
    ],
    emptyHint:
      'Describe qué estás evitando y por qué se siente difícil. MindPulse encontrará el primer paso útil más pequeño.',
    examples: [
      'Perdí la tarde y siento que voy atrasado. Dame un plan tranquilo de 20 minutos para retomar.',
      'No puedo empezar el ensayo porque parece enorme. Haz que el primer paso sea pequeño y concreto.',
      'Ayúdame a recuperar la confianza después de un mal examen sin fingir que todo está bien.',
    ],
    intake: [
      {
        id: 'avoiding',
        label: '¿Qué estás evitando?',
        placeholder: 'Ej.: Empezar el ensayo; parece demasiado grande…',
        multiline: true,
        maxLength: 300,
      },
      {
        id: 'energy',
        label: 'Tu energía ahora',
        placeholder: 'Ej.: Bastante baja; estoy cansado después de clases',
        maxLength: 120,
      },
    ],
  },
  {
    id: 'habit',
    route: '/habits',
    iconId: 'repeat',
    title: 'Guía de hábitos',
    shortTitle: 'Hábitos',
    headline: 'Crea rutinas que resistan la vida real.',
    copy: 'Crea rutinas que funcionen incluso en días ocupados.',
    explanation:
      'Úsalo para crear una rutina flexible, lo bastante pequeña para repetirla y sin depender de la culpa.',
    outcome:
      'Comparte el hábito, el obstáculo habitual y un horario realista. MindPulse diseñará una rutina repetible.',
    bestFor: ['Crear hábitos', 'Ser constante', 'Rutinas sencillas'],
    emptyHint:
      'Indica el hábito, cuándo quieres hacerlo y qué suele interrumpirlo. MindPulse lo hará más pequeño y repetible.',
    examples: [
      'Ayúdame a crear un hábito de estudio de 10 minutos que funcione incluso en días escolares ocupados.',
      'Diseña una rutina matutina para días de clase que no se derrumbe si me levanto tarde.',
      'Abandono los hábitos después de 3 días. Crea un reinicio flexible con una versión de respaldo.',
    ],
    intake: [
      {
        id: 'habit',
        label: 'Hábito que quieres crear',
        placeholder: 'Ej.: Repasar 10 minutos después de cenar',
        maxLength: 120,
      },
      {
        id: 'obstacle',
        label: '¿Qué suele interrumpirlo?',
        placeholder: 'Ej.: Me distraigo con el teléfono…',
        multiline: true,
        maxLength: 300,
      },
    ],
  },
  {
    id: 'goal',
    route: '/goals',
    iconId: 'target',
    title: 'División de metas',
    shortTitle: 'Metas',
    headline: 'Haz que una meta grande sea lo bastante pequeña para empezar.',
    copy: 'Divide metas grandes en hitos y acciones siguientes.',
    explanation:
      'Úsalo cuando una meta sea demasiado grande y necesites dividirla en pasos visibles y posibles.',
    outcome:
      'Comparte la meta, por qué importa y cuándo quieres avanzar. MindPulse la convertirá en hitos y acciones.',
    bestFor: [
      'Metas grandes',
      'Portafolios',
      'Metas académicas y profesionales',
    ],
    emptyHint:
      'Escribe la meta y una fecha aproximada. MindPulse la dividirá en hitos, pasos semanales y una primera acción para hoy.',
    examples: [
      'Divide mi proyecto semestral en hitos semanales, riesgos y las primeras 3 acciones.',
      'Convierte “mejorar mis calificaciones” en un plan concreto de 30 días con puntos de control medibles.',
      'Ayúdame a definir una meta de portafolio que pueda terminar en un mes mientras estudio.',
    ],
    intake: [
      {
        id: 'goal',
        label: 'La meta principal',
        placeholder: 'Ej.: Terminar mi proyecto semestral',
        multiline: true,
        maxLength: 300,
      },
      {
        id: 'timeframe',
        label: 'Fecha aproximada',
        placeholder: 'Ej.: Fin de mes',
        maxLength: 60,
      },
    ],
  },
  {
    id: 'reflection',
    route: '/reflection',
    iconId: 'sparkles',
    title: 'Reflexión rápida',
    shortTitle: 'Reflexión',
    headline: 'Comprende tu día sin culparte.',
    copy: 'Aprende de hoy sin convertirlo en culpa.',
    explanation:
      'Úsalo para comprender qué pasó hoy, conservar la lección útil y seguir adelante con calma.',
    outcome:
      'Comparte qué pasó, qué fue difícil y qué quieres aprender. MindPulse te ayudará a encontrar una conclusión serena.',
    bestFor: ['Autoconocimiento', 'Reflexión semanal', 'Claridad emocional'],
    emptyHint:
      'Empieza con una frase sincera sobre tu día. MindPulse hará mejores preguntas y te ayudará a encontrar la lección útil.',
    examples: [
      'Guíame en una reflexión semanal de 5 minutos con 3 preguntas sinceras.',
      'No terminé mi plan. Ayúdame a aprender de eso sin convertirlo en culpa.',
      'Convierte los pensamientos desordenados de hoy en una conclusión tranquila y una acción siguiente.',
    ],
    intake: [
      {
        id: 'happened',
        label: 'Una frase sincera sobre tu día',
        placeholder: 'Ej.: Planeé cinco tareas y terminé una…',
        multiline: true,
        maxLength: 300,
      },
    ],
  },
];
