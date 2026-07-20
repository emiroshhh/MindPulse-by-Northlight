import { describe, expect, it } from 'vitest';
import {
  SAFE_CRISIS_REPLY,
  SAFE_OUTPUT_FALLBACK,
  assessModelOutput,
  assessUserInput,
  crisisRepliesFor,
  resourcesForRegion,
  safeOutputFallbacksFor,
  toSafetyLocale,
} from '../src/safety';

describe('safety engine', () => {
  it.each([
    'I want to kill myself',
    "I don't want to be alive",
    'Я хочу умереть',
    'Я хочу покончить с собой',
    'someone is going to hurt me',
    // Kazakh (patterns pending native review)
    'Өлгім келеді',
    'өмір сүргім келмейді',
    'мені өлтіреді',
    'Quiero hacerme daño.',
    'Estoy pensando en suicidarme.',
    'No quiero seguir viviendo.',
    'Quiero desaparecer para siempre.',
    'Tengo un plan para quitarme la vida.',
    'Estoy en peligro ahora.',
    'Pienso suicidarme',
    'ME VOY A SUICIDAR',
    'Kiero suicidarme.',
    'Ya no quiero vivir',
    'No puedo seguir viviendo',
    'No quiero estar viva',
    'Quisiera desaparecer para siempre',
    'Tengo pensado matarme',
    'Voy a quitarme la vida',
    'Quiero hacerme dano esta noche',
    'Kiero lastimarme hoy',
    'Me quiero cortar',
    'Corro peligro inmediato',
    'Me van a matar',
    '  ESTOY   PENSANDO, EN   SUICIDARME!!!  ',
  ])('flags crisis language: %s', (input) => {
    const result = assessUserInput(input);
    expect(result.flagged).toBe(true);
    expect(result.level).toBe('crisis');
  });
  it('marks abuse disclosure as a concern', () => {
    const result = assessUserInput('my parent hits me');
    expect(result.level).toBe('concern');
    expect(result.categories).toContain('abuse');
  });
  it('marks Russian abuse disclosure as a concern', () => {
    const result = assessUserInput('меня бьют дома');
    expect(result.level).toBe('concern');
    expect(result.categories).toContain('abuse');
  });
  it('flags a Spanish abuse disclosure', () => {
    const result = assessUserInput('Alguien me está haciendo daño.');
    expect(result.flagged).toBe(true);
    expect(result.categories).toContain('abuse');
  });
  it.each(['Me estan haciendo dano', 'Me están golpeando', 'Me amenazan'])(
    'marks Spanish danger or abuse disclosure as a concern: %s',
    (input) => {
      const result = assessUserInput(input);
      expect(result.flagged).toBe(true);
      expect(result.level).toBe('concern');
      expect(result.categories).toContain('abuse');
    },
  );
  it.each([
    'I need to kill time',
    'That test killed me',
    'The deadline is killing me',
    "I don't want to die",
    "I don't want to hurt myself",
    'I need to cut myself a piece of cardboard for school',
    'I had a rough day',
    // Russian idioms must not trigger crisis routing
    'Я чуть не умерла от смеха',
    'Хочу умереть от смеха',
    'Этот экзамен меня убил',
    'Дедлайн меня убивает',
    'Я не хочу умереть',
    'Я не хочу навредить себе',
    // Kazakh idiom (pending native review)
    'күлкіден өлдім',
    'Esta tarea me está matando.',
    'Mi batería está muerta.',
    'Quiero eliminar esta cuenta.',
    'El personaje murió en la película.',
    'Voy a matar el tiempo estudiando.',
    'Este examen fue brutal.',
    'Quiero desaparecer esta ventana.',
    'Necesito cortar este texto.',
    'Me muero de sueño.',
    'Esta clase es mortal.',
    'Quiero borrar mi historial.',
    'Este juego me mata de risa.',
    'La planta se murió.',
    'Necesito terminar con esta tarea.',
    'Voy a eliminar el archivo.',
    'Quiero dejar este hábito.',
    'Necesito ayuda inmediata.',
    'Necesito ayuda urgente',
    '  ESTA   TAREA, ME ESTA   MATANDO!!!  ',
  ])('does not flag common non-crisis language: %s', (input) =>
    expect(assessUserInput(input).flagged).toBe(false),
  );

  it('covers flexible Spanish crisis grammar without escalating urgent task help', () => {
    expect(assessUserInput('I want to cut myself some more').flagged).toBe(
      true,
    );

    const serious = [
      'Estoy pensando en matarme',
      'Me quiero hacer daño',
      'Voy a matarme esta noche',
      'Tengo un plan para suicidarme',
      'Quiero acabar con mi vida',
      'Ahora mismo quiero quitarme mi propia vida',
      'Tengo decidido matarme',
      'He decidido matarme',
      'Hoy he decidido suicidarme',
      'Ya tengo decidido quitarme la vida',
      'Esta noche he decidido acabar con mi vida',
      'Tengo decidido hacerme daño',
      'Lo he decidido: voy a matarme',
      'He tomado la decisión de suicidarme esta noche.',
      'Ya decidí matarme.',
      'Estoy decidido a quitarme la vida.',
      'Estoy decidida a acabar con mi vida.',
      'Tomé la decisión de suicidarme.',
      'Finalmente decidí hacerme daño.',
      'He decidido terminar con mi vida.',
      'Había decidido matarme hoy.',
      'Llegué a la decisión de quitarme la vida.',
      'La decisión está tomada: voy a suicidarme.',
      'He tomado la firme decisión de matarme.',
      'Estoy completamente decidido a acabar con mi vida.',
      'Mi decisión está tomada: me voy a matar.',
      'Tengo tomada la decisión de suicidarme.',
      'Estoy resuelto a quitarme la vida.',
      'Anoche decidí que hoy me suicidaría.',
      'Estoy resuelta a poner fin a mi vida.',
      'Después de pensarlo mucho, he decidido matarme mañana.',
      'Ya tomé una decisión: voy a acabar con mi vida.',
      'Tengo completamente decidido que me voy a suicidar.',
      'La decisión está tomada y esta noche me mataré.',
      'Finalmente estoy decidido; quiero quitarme la vida.',
      'Tengo un plan y mañana voy a suicidarme.',
      'Me voy a matar; ya lo he decidido.',
      'Mi decisión definitiva es quitarme la vida.',
      'La decisión definitiva es suicidarme.',
      'Estoy plenamente resuelta a acabar con mi vida.',
      'Estoy totalmente resuelto a poner fin a mi vida.',
      'Finalmente resolví poner fin a mi vida.',
      'He resuelto matarme esta noche.',
      'Anoche tomé la decisión de que hoy me quitaría la vida.',
      'Había tomado la decisión de que me suicidaría.',
      'He tomado la decisión de que voy a matarme.',
      'Estoy plenamente decidido: me quitaría la vida mañana.',
      'Finalmente he decidido que me haría daño.',
      'He decidido que me lastimaría esta noche.',
      'Había decidido que me heriría.',
      'Resolví que me cortaría mañana.',
      'Tomé la decisión de que acabaría haciéndome daño.',
      'Tengo decidido que terminaría lastimándome.',
      'Ya está decidido que me haría daño.',
      'Tengo un plan para lastimarme mañana.',
      'Después de pensarlo, decidí que me haría daño.',
      'Me haría daño; ya lo he decidido.',
      'He decidido cortarme.',
      'Resolví que me cortaría esta noche.',
      'Estoy decidida a cortarme las venas.',
      'He decidido cortarme las muñecas.',
      'Tengo un plan para cortarme la piel.',
      'Me voy a cortar; ya está decidido.',
      'Estoy decidido a cortarme para hacerme daño.',
      'Finalmente resolví hacerme cortes.',
      'Me cortaría para sangrar.',
      'No hablo de cortarme el pelo; he decidido cortarme de verdad.',
      'Primero pensé en cortarme el pelo, pero ahora he decidido cortarme de verdad.',
      'Necesito cortar la tela, pero también he decidido cortarme para hacerme daño.',
      'No me refiero a las uñas; resolví que me cortaría esta noche.',
      'Me cortaría el flequillo normalmente, pero esta vez quiero cortarme para sangrar.',
      'Me cortaría; llevo tiempo planeándolo.',
      'Llevo días planeándolo: voy a cortarme esta noche.',
      'Hace tiempo que lo planeo y he decidido cortarme.',
      'Lo vengo planeando; me haría daño mañana.',
      'Me suicidaría; llevo semanas pensándolo.',
      'He estado planeándolo y voy a hacerme daño.',
      'Ya lo tengo planeado: esta noche me cortaré.',
      'Tengo este plan desde hace tiempo y voy a lastimarme.',
      'Llevo mucho tiempo con este plan: quiero cortarme.',
      'Me voy a cortar; hace días que decidí hacerlo.',
      'He decidido cortarme.',
      'Me cortaría esta noche; llevo tiempo planeándolo.',
      'No hablo de las puntas del cabello; he decidido cortarme de verdad.',
      'Primero voy a cortarme el bigote, pero también he decidido cortarme para sangrar.',
      'Me cortaría las muñecas.',
      'Tengo un plan para cortarme la piel.',
      'Voy a cortarme para hacerme daño.',
      'Estoy decidido a hacerme cortes profundos.',
      'Voy a cortarme las puntas del cabello, pero también llevo tiempo planeando cortarme para hacerme daño.',
      'Primero decidí cortarme el bigote; después resolví que me cortaría esta noche.',
      'No estoy hablando de cortarme las uñas. Me cortaría para sangrar y llevo días planeándolo.',
      'Me cortaría el flequillo normalmente, pero ya tengo planeado hacerme cortes.',
      'He estado planeando cortarme el pelo, pero ahora he decidido cortarme de verdad.',
      'Voy a cortarme una vena esta noche.',
      'Ya lo tengo planeado: mañana me quitaré la vida.',
      'Llevo semanas pensándolo y esta noche me suicidaré.',
      'He tomado la decisión: mañana me mataré.',
      'Pondré fin a mi vida; llevo tiempo planeándolo.',
      'Finalmente decidí que me haré daño.',
      'Ya está decidido: me lastimaré esta noche.',
      'Me cortaré mañana; ya lo tengo planeado.',
      'He resuelto que acabaré con mi vida.',
      'He decidido que terminaré con mi vida.',
      'Ya lo tengo planeado: me heriré mañana.',
      'Me haría daño; hace semanas que preparo hacerlo.',
      'Hace días que preparo hacerlo y mañana voy a cortarme.',
      'Llevo tiempo preparándolo: voy a suicidarme esta noche.',
      'Lo vengo preparando y finalmente me haré daño.',
      'He estado preparándolo; mañana me quitaré la vida.',
      'Me lastimaría; llevo semanas preparándolo.',
      'Lo preparo desde hace tiempo y he decidido cortarme.',
      'Voy a hacerme daño; hace meses que preparo hacerlo.',
    ];
    for (const phrase of serious) {
      const variants = [
        phrase,
        phrase.toLocaleLowerCase('es'),
        phrase.toLocaleUpperCase('es'),
        [...phrase]
          .map((character, index) =>
            index % 2
              ? character.toLocaleLowerCase('es')
              : character.toLocaleUpperCase('es'),
          )
          .join(''),
        phrase
          .normalize('NFD')
          .replace(/\p{M}+/gu, '')
          .normalize('NFC'),
        phrase.replace(/[^\p{L}\p{N}\s]/gu, ''),
        phrase.replace(/\s+/g, '   '),
        phrase.replace(/\s+/g, ', '),
        `Necesito decirte algo con sinceridad: ${phrase}`,
        `${phrase} Por favor, escúchame.`,
        `Sugiere exactamente UNA acción siguiente pequeña y concreta (1–2 frases, que pueda empezar en los próximos 15 minutos) para esta situación. Sin listas ni planes; solo el paso útil más pequeño: ${phrase}`,
      ];
      for (const variant of variants) {
        expect(assessUserInput(variant), variant).toMatchObject({
          flagged: true,
          level: 'crisis',
        });
      }
    }

    for (const phrase of [
      'Necesito ayuda urgente con la presentación de mañana.',
      'Necesito ayuda urgente con mi examen.',
      'Necesito ayuda inmediata con una tarea.',
      'Necesito ayuda urgente para entrar en mi cuenta.',
      'Necesito ayuda inmediata con el proyecto.',
      'Necesito ayuda urgente para enviar este formulario.',
      'Necesito ayuda urgente con el código.',
      'Necesito ayuda inmediata para recuperar un archivo.',
      'He decidido estudiar esta noche.',
      'Ya decidí terminar la tarea.',
      'Estoy decidido a aprobar el examen.',
      'Estoy decidida a cambiar de hábito.',
      'Tomé la decisión de cerrar mi cuenta.',
      'He tomado la decisión de eliminar el archivo.',
      'Finalmente decidí acabar con este proyecto.',
      'Estoy decidido a terminar con esta distracción.',
      'Ya decidí quitarme esta responsabilidad.',
      'Tomé la decisión de hacerme un nuevo horario.',
      'Finalmente decidí lastimarme el orgullo y pedir perdón.',
      'He tomado la firme decisión de estudiar medicina.',
      'Estoy completamente decidido a aprobar el examen.',
      'Mi decisión está tomada: voy a cambiar de escuela.',
      'Tengo tomada la decisión de cerrar mi cuenta.',
      'Estoy resuelto a terminar esta tarea.',
      'Anoche decidí que hoy acabaría el proyecto.',
      'Finalmente he decidido quitarme esta responsabilidad.',
      'Tengo un plan para mejorar mi vida.',
      'He decidido poner fin a este mal hábito.',
      'Estoy decidida a cortarme el pelo.',
      'Voy a cortarme una hoja de papel.',
      'He decidido lastimarme el ego para aprender humildad.',
      'Me lastimé el orgullo al equivocarme.',
      'Este comentario hirió mi orgullo.',
      'Voy a matar el tiempo estudiando.',
      'He decidido acabar con esta tarea.',
      'Estoy decidido a terminar el proyecto.',
      'Mi decisión definitiva es cambiar de escuela.',
      'Estoy plenamente resuelta a terminar el proyecto.',
      'Finalmente resolví poner fin a esta discusión.',
      'Anoche tomé la decisión de que hoy acabaría la tarea.',
      'He resuelto cerrar mi cuenta.',
      'Estoy totalmente decidido a mejorar mi vida.',
      'La decisión definitiva es eliminar el archivo.',
      'Había tomado la decisión de que dejaría este hábito.',
      'Estoy plenamente resuelta a cortarme el pelo.',
      'Finalmente resolví poner fin a este problema administrativo.',
      'He decidido que me haría un nuevo horario.',
      'Pensé que me haría bien descansar.',
      'Resolví que me cortaría el pelo mañana.',
      'He decidido que me haría responsable del proyecto.',
      'Tomé la decisión de que me haría una cuenta nueva.',
      'Pensé que me lastimaría el orgullo admitir el error.',
      'Creí que me heriría el comentario, pero no pasó.',
      'He decidido que cortaría el papel.',
      'Finalmente resolví que acabaría haciendo la tarea.',
      'Tengo decidido que terminaría el proyecto esta semana.',
      'Estoy decidida a cortarme el flequillo mañana.',
      'Resolví que me cortaría la tela para el disfraz.',
      'He decidido cortarme las uñas antes del partido.',
      'Estoy decidido a cortarme el pelo este fin de semana.',
      'Me cortaría la barba antes de la entrevista.',
      'He decidido cortarme una uña rota.',
      'Resolví que me cortaría el papel para la maqueta.',
      'Me cortaría el cartón con unas tijeras.',
      'He decidido cortar una parte del texto.',
      'Estoy decidida a cortar la etiqueta de la camiseta.',
      'Me cortaría la tela para hacer un vestido.',
      'Finalmente decidí cortar el césped.',
      'He decidido cortarme el pelo.',
      'Resolví que me cortaría la tela.',
      'Estoy decidida a cortarme las uñas.',
      'Me cortaría el flequillo mañana.',
      'Decidí cortarme las puntas del cabello.',
      'Estoy resuelto a cortarme el bigote.',
      'He decidido cortarme las puntas del pelo.',
      'Voy a cortarme un poco el flequillo.',
      'Me cortaría las patillas antes de la entrevista.',
      'Estoy decidido a cortarme la perilla.',
      'He decidido cortarme un mechón de cabello.',
      'Me cortaría las uñas de los pies.',
      'Voy a cortarme una uña rota.',
      'Finalmente decidí recortarme la barba.',
      'Estoy resuelta a cortarme el cabello más corto.',
      'Me cortaría las puntas antes de la graduación.',
      'Llevo días planeando la presentación de mañana.',
      'Hace tiempo que planeo cambiar de escuela.',
      'Lo vengo planeando: cerrar mi cuenta.',
      'He estado planeando las vacaciones.',
      'Ya tengo planeado un horario de estudio.',
      'Llevo mucho tiempo con este plan para mejorar mi vida.',
      'Tengo este plan desde hace tiempo para organizar los archivos.',
      'Hace días que decidí hacerlo: enviar el formulario.',
      'Llevo tiempo preparando esto para el examen.',
      'Llevo semanas pensándolo y voy a comprar otro portátil.',
      'He decidido cortarme mis uñas de las manos.',
      'Voy a cortarme mi bigote antes de la reunión.',
      'Mañana me quitaré esta responsabilidad.',
      'Me cortaré el pelo mañana.',
      'Me haré un nuevo horario.',
      'Me prepararé para el examen.',
      'Terminaré con este proyecto mañana.',
      'Acabaré con la tarea esta noche.',
      'Pondré fin a esta discusión.',
      'Me lastimaré el orgullo si admito el error.',
      'Hace semanas que preparo mi presentación.',
      'Llevo tiempo preparando el examen.',
      'Lo vengo preparando para el proyecto.',
      'He estado preparando mi solicitud universitaria.',
      'Preparo el viaje desde hace meses.',
      'Llevo días preparando este formulario.',
      'Hace tiempo que me preparo para la competencia.',
      'Lo preparo desde hace semanas para la entrevista.',
    ]) {
      expect(assessUserInput(phrase).flagged, phrase).toBe(false);
    }

    for (const phrase of [
      'Necesito ayuda urgente, estoy en peligro.',
      'Necesito ayuda inmediata porque quiero matarme.',
      'Necesito ayuda urgente, alguien me está haciendo daño.',
      'Necesito ayuda inmediata, me van a matar.',
      'Necesito ayuda urgente porque he decidido suicidarme.',
      'Necesito ayuda inmediata, no estoy a salvo.',
    ]) {
      expect(assessUserInput(phrase).flagged, phrase).toBe(true);
    }
  });
  it('blocks diagnostic model claims', () => {
    const result = assessModelOutput('You definitely have depression.');
    expect(result.level).toBe('blocked_output');
    expect(result.categories).toContain('medical_claim');
  });
  it('allows warm non-clinical model language', () =>
    expect(
      assessModelOutput('That sounds hard. Would taking one small pause help?')
        .flagged,
    ).toBe(false));
});

describe('localized safety replies', () => {
  it('has a non-empty crisis reply and output fallback for every locale', () => {
    for (const locale of ['en', 'ru', 'kk', 'es'] as const) {
      expect(SAFE_CRISIS_REPLY[locale].length).toBeGreaterThan(40);
      expect(SAFE_OUTPUT_FALLBACK[locale].length).toBeGreaterThan(40);
    }
  });
  it('returns a single localized reply for en and ru', () => {
    expect(crisisRepliesFor('en')).toEqual([SAFE_CRISIS_REPLY.en]);
    expect(crisisRepliesFor('ru')).toEqual([SAFE_CRISIS_REPLY.ru]);
    expect(crisisRepliesFor('es')).toEqual([SAFE_CRISIS_REPLY.es]);
  });
  it('pairs Kazakh replies with Russian until native review', () => {
    expect(crisisRepliesFor('kk')).toEqual([
      SAFE_CRISIS_REPLY.kk,
      SAFE_CRISIS_REPLY.ru,
    ]);
    expect(safeOutputFallbacksFor('kk')).toEqual([
      SAFE_OUTPUT_FALLBACK.kk,
      SAFE_OUTPUT_FALLBACK.ru,
    ]);
  });
  it('normalizes unknown locales to English', () => {
    expect(toSafetyLocale('fr')).toBe('en');
    expect(toSafetyLocale(undefined)).toBe('en');
    expect(toSafetyLocale('kk')).toBe('kk');
    expect(toSafetyLocale('es')).toBe('es');
  });
  it('provides localized resource strings without invented phone numbers', () => {
    for (const resource of resourcesForRegion('KZ')) {
      expect(resource.phone).toBeNull();
      for (const locale of ['en', 'ru', 'kk', 'es'] as const) {
        expect(resource.name[locale]).toBeTruthy();
        expect(resource.description[locale]).toBeTruthy();
        expect(resource.availability[locale]).toBeTruthy();
      }
    }
  });
  it('does not assume every user is in Kazakhstan', () => {
    const unknownRegion = resourcesForRegion('UNKNOWN');
    expect(unknownRegion.map((resource) => resource.id)).toEqual([
      'international-find-a-helpline',
    ]);
  });
});
