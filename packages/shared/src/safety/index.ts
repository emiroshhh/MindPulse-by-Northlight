/**
 * Locale coverage for safety-critical strings. Wider than the legacy `Locale`
 * type on purpose: safety messages must exist for every UI language the web
 * app offers (en/ru/kk/es), independent of the legacy shared content types.
 */
export type SafetyLocale = 'en' | 'ru' | 'kk' | 'es';

export type SafetyCategory =
  | 'self_harm'
  | 'suicide'
  | 'abuse'
  | 'acute_danger'
  | 'medical_claim'
  | 'sexual_content'
  | 'harmful_behavior'
  | 'isolation';

export type SafetyLevel = 'safe' | 'concern' | 'crisis' | 'blocked_output';

export interface SafetyAssessment {
  level: SafetyLevel;
  flagged: boolean;
  categories: SafetyCategory[];
  matchedSignals: string[];
}

const INPUT_SIGNALS: Array<{
  category: SafetyCategory;
  level: 'concern' | 'crisis';
  patterns: RegExp[];
  spanishPatterns?: RegExp[];
}> = [
  {
    category: 'suicide',
    level: 'crisis',
    patterns: [
      /\b(kill|end)\s+myself\b/i,
      /\b(suicid(?:e|al)|want\s+to\s+die|don'?t\s+want\s+to\s+(?:be\s+)?alive)\b/i,
      /(покончи(?:ть|л)?\s+с\s+собой|самоубийств[\p{L}-]*|хочу\s+умереть|не\s+хочу\s+жить)/iu,
      // Kazakh patterns: NEEDS NATIVE REVIEW before kk safety coverage can be
      // called complete. Until then kk crisis replies are shown with Russian.
      /(өз[-\s]?өзіме\s+қол\s+жұмса|өзімді\s+өлтір|өлгім\s+келеді|өмір\s+сүргім\s+келмейді|суицид)/iu,
    ],
    spanishPatterns: [
      /(?:estoy\s+)?(?:pensando|pienso)(?:\s+en)?\s+(?:suicidarme|matarme)/iu,
      /(?:me\s+)?voy\s+a\s+(?:suicidar(?:me)?|matarme)(?:\s+(?:esta\s+noche|hoy|ahora|ahora\s+mismo))?/iu,
      /(?:ahora\s+mismo\s+)?(?:quiero|kiero|quisiera)\s+(?:suicidarme|matarme|acabar\s+con\s+mi\s+vida|quitarme\s+(?:la|mi\s+propia)\s+vida)/iu,
      /(?:ya\s+)?no\s+quiero\s+(?:seguir\s+)?(?:vivir|viviendo)/iu,
      /no\s+puedo\s+seguir\s+viviendo/iu,
      /no\s+quiero\s+estar\s+viv[oa]/iu,
      /(?:quiero|quisiera)\s+desaparecer\s+para\s+siempre/iu,
      /tengo\s+(?:un\s+plan\s+para|pensado)\s+(?:suicidarme|matarme|acabar\s+con\s+mi\s+vida|quitarme\s+(?:la|mi\s+propia)\s+vida)/iu,
      /(?:quiero|voy\s+a)\s+quitarme\s+(?:la|mi\s+propia)\s+vida/iu,
    ],
  },
  {
    category: 'self_harm',
    level: 'crisis',
    patterns: [
      /\b(hurt|harm|cut)\s+myself\b/i,
      /\bself[- ]?harm(?:ing)?\b/i,
      /(навреди(?:ть|л[аи]?)\s+себе|порезать\s+себя|селфхарм[\p{L}-]*)/iu,
      // NEEDS NATIVE REVIEW (kk)
      /(өзіме\s+зиян\s+тигіз|өзімді\s+кес)/iu,
    ],
    spanishPatterns: [
      /(?:(?:quiero|kiero|voy\s+a)\s+(?:hacerme\s+dano|lastimarme)|me\s+(?:quiero|kiero)\s+(?:hacer\s+dano|lastimar))(?:\s+(?:esta\s+noche|hoy|ahora|ahora\s+mismo))?/iu,
    ],
  },
  {
    category: 'acute_danger',
    level: 'crisis',
    patterns: [
      /\b(?:i(?:'m| am)\s+)?in\s+(?:immediate\s+)?danger\b/i,
      /\b(?:they|someone)\s+(?:is\s+)?(?:going\s+to|will)\s+(?:kill|hurt)\s+me\b/i,
      /(?:я\s+)?в\s+(?:непосредственной\s+)?опасности/iu,
      /(?:меня|мне)\s+(?:сейчас\s+)?(?:убьют|причинят\s+вред)/iu,
      // NEEDS NATIVE REVIEW (kk)
      /(мен\s+қауіпте(?:мін)?|мені\s+өлтіреді)/iu,
    ],
    spanishPatterns: [
      /(?:estoy|corro)\s+(?:en\s+)?peligro(?:\s+(?:ahora|inmediato))?/iu,
      /no\s+estoy\s+(?:a\s+salvo|segur[oa])/iu,
      /me\s+van\s+a\s+matar/iu,
    ],
  },
  {
    category: 'abuse',
    level: 'concern',
    patterns: [
      /\b(?:being|am)\s+(?:abused|hit|threatened)\b/i,
      /\b(?:my|a)\s+(?:parent|teacher|coach|partner)\s+(?:hits|touches|threatens)\s+me\b/i,
      /меня\s+(?:бьют|трогают|насилуют|шантажируют|угрожают)/iu,
      // NEEDS NATIVE REVIEW (kk)
      /(мені\s+(?:ұрады|қорқытады|соғады))/iu,
    ],
    spanishPatterns: [
      /(?:alguien\s+)?me\s+esta[n]?\s+haciendo\s+dano/iu,
      /me\s+estan\s+golpeando/iu,
      /me\s+amenazan/iu,
    ],
  },
];

const OUTPUT_BLOCKS: Array<{ category: SafetyCategory; patterns: RegExp[] }> = [
  {
    category: 'medical_claim',
    patterns: [
      /\byou (?:definitely |clearly )?have (?:depression|anxiety|adhd|bipolar)/i,
      /\bi (?:diagnose|prescribe)\b/i,
      /у тебя (?:точно |явно )?(?:депрессия|тревожное расстройство|сдвг)/iu,
      /(?:definitivamente|claramente)\s+tienes\s+(?:depresión|ansiedad|tdah|trastorno\s+bipolar)/iu,
      /(?:te\s+diagnostico|te\s+receto)/iu,
    ],
  },
  {
    category: 'harmful_behavior',
    patterns: [
      /\b(?:here(?:'s| is) how to|you should) (?:hide|cut|purge|starve|overdose)\b/i,
      /(?:скрой|порежь|голодай|прими передозировку)/iu,
      /(?:deberías|así\s+puedes)\s+(?:ocultar|cortarte|dejar\s+de\s+comer|tomar\s+una\s+sobredosis)/iu,
    ],
  },
  {
    category: 'isolation',
    patterns: [
      /\bdon'?t (?:tell|trust) (?:your parents|any adult|anyone)\b/i,
      /\byou only need me\b/i,
      /никому не (?:говори|доверяй)/iu,
      /no\s+(?:se\s+lo\s+digas|confíes)\s+(?:a\s+nadie|en\s+nadie)/iu,
      /solo\s+me\s+necesitas\s+a\s+mí/iu,
    ],
  },
  {
    category: 'sexual_content',
    patterns: [
      /\bi want to (?:kiss|date|sleep with) you\b/i,
      /\bsend me (?:a )?(?:nude|sexy)\b/i,
    ],
  },
];

const FALSE_POSITIVE_PHRASES = [
  /\bkill(?:ing)? time\b/gi,
  /\bthat test killed me\b/gi,
  /\bdeadline is killing me\b/gi,
  /\bi\s+(?:do\s+not|don'?t)\s+want\s+to\s+(?:die|kill\s+myself|hurt\s+myself|harm\s+myself|cut\s+myself)\b/gi,
  /\bcut\s+myself\s+(?:a|some)\s+(?:piece|strip|sheet|slice)\s+of\s+(?:paper|cardboard|fabric|tape|string)\b/gi,
  // No \b around Cyrillic: JS \b only understands ASCII \w, so a word
  // boundary next to a Cyrillic letter never matches.
  /умер(?:еть|ла)?\s+от\s+смеха/giu,
  /эт(?:от|а)\s+(?:тест|экзамен|контрольная)\s+меня\s+убил[а]?/giu,
  /дедлайн\s+меня\s+убивает/giu,
  /я\s+не\s+хочу\s+(?:умереть|покончить\s+с\s+собой|навредить\s+себе|порезать\s+себя)/giu,
  // NEEDS NATIVE REVIEW (kk): "күлкіден өлдім" = "died laughing"
  /күлкіден\s+өл(?:дім|еміз|ді)/giu,
  /esta\s+tarea\s+me\s+está\s+matando/giu,
  /mi\s+batería\s+está\s+muerta/giu,
  /quiero\s+eliminar\s+esta\s+cuenta/giu,
  /el\s+personaje\s+murió\s+en\s+la\s+película/giu,
  /voy\s+a\s+matar\s+el\s+tiempo\s+estudiando/giu,
  /este\s+examen\s+fue\s+brutal/giu,
  /quiero\s+desaparecer\s+esta\s+ventana/giu,
  /necesito\s+cortar\s+este\s+texto/giu,
];

function normalizedForScreening(value: string) {
  return FALSE_POSITIVE_PHRASES.reduce(
    (text, phrase) => text.replace(phrase, '[idiom]'),
    value.normalize('NFKC'),
  );
}

const SPANISH_FALSE_POSITIVE_PHRASES = [
  /esta\s+tarea\s+me\s+esta\s+matando/giu,
  /mi\s+bateria\s+esta\s+muerta/giu,
  /quiero\s+eliminar\s+esta\s+cuenta/giu,
  /el\s+personaje\s+murio\s+en\s+la\s+pelicula/giu,
  /voy\s+a\s+matar\s+el\s+tiempo\s+estudiando/giu,
  /este\s+examen\s+fue\s+brutal/giu,
  /quiero\s+desaparecer\s+esta\s+ventana/giu,
  /necesito\s+cortar\s+este\s+texto/giu,
  /me\s+muero\s+de\s+sueno/giu,
  /esta\s+clase\s+es\s+mortal/giu,
  /quiero\s+borrar\s+mi\s+historial/giu,
  /este\s+juego\s+me\s+mata\s+de\s+risa/giu,
  /la\s+planta\s+se\s+murio/giu,
  /necesito\s+terminar\s+con\s+esta\s+tarea/giu,
  /voy\s+a\s+eliminar\s+el\s+archivo/giu,
  /quiero\s+dejar\s+este\s+habito/giu,
];

/**
 * These are complete benign expressions, not individual words. Masking them
 * after normalization lets the committed-intent matcher remain strict about
 * self-directed actions without treating common idioms as crisis language.
 */
const SPANISH_HARMLESS_IDIOMS = [
  /\blastimarme\s+el\s+(?:orgullo|ego)\b/giu,
  /\b(?:herir|hirio|heria|herido)\s+mi\s+orgullo\b/giu,
  /\bmatar\s+el\s+tiempo\b/giu,
  /\b(?:me\s+)?muero\s+de\s+(?:sueno|risa)\b/giu,
  /\bacabar\s+con\s+(?:la|esta)\s+tarea\b/giu,
  /\bterminar\s+con\s+(?:el|este)\s+proyecto\b/giu,
  /\bquitarme\s+(?:una|esta|mi)\s+responsabilidad\b/giu,
  /\b(?:eliminar|borrar)\s+mi\s+cuenta\b/giu,
  /\b(?:borrar|eliminar)\s+(?:el\s+)?archivo\b/giu,
  /\bme\s+lastimar(?:e|ia)\s+el\s+orgullo\b/giu,
  /\bme\s+heriria\s+el\s+comentario\b/giu,
  /\bponer\s+fin\s+a\s+(?:este\s+)?mal\s+habito\b/giu,
];

function normalizedSpanishForScreening(value: string) {
  const normalized = value
    .normalize('NFKC')
    .normalize('NFD')
    .replace(/(\p{Script=Latin})\p{M}+/gu, '$1')
    .normalize('NFC')
    .toLocaleLowerCase('es')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  const screened = SPANISH_FALSE_POSITIVE_PHRASES.reduce(
    (text, phrase) => text.replace(phrase, '[idiom]'),
    normalized,
  );

  return SPANISH_HARMLESS_IDIOMS.reduce(
    (text, phrase) => text.replace(phrase, '[idiom]'),
    screened,
  );
}

type SpanishCommittedIntentCategory = 'suicide' | 'self_harm';

interface SpanishSignalSpan {
  category: SpanishCommittedIntentCategory;
  start: number;
  end: number;
  imminent?: boolean;
}

const SPANISH_ACTION_PATTERNS: Array<{
  category: SpanishCommittedIntentCategory;
  pattern: RegExp;
  imminent?: boolean;
  cutting?: boolean;
}> = [
  {
    category: 'suicide',
    pattern: /\b(?:me\s+voy\s+a\s+matar|me\s+matare|me\s+mataria)\b/giu,
    imminent: true,
  },
  {
    category: 'suicide',
    pattern:
      /\b(?:me\s+voy\s+a\s+suicidar|me\s+suicidare|me\s+suicidaria|voy\s+a\s+suicidarme|voy\s+a\s+suicidar|me\s+quitar(?:e|ia)\s+la\s+vida|me\s+suicidaria|me\s+mataria|pondr(?:e|ia)\s+fin\s+a\s+mi\s+vida|(?:acabar|terminar)e\s+con\s+mi\s+vida)\b/giu,
    imminent: true,
  },
  {
    category: 'suicide',
    pattern:
      /\b(?:matarme|suicidarme|voy\s+a\s+quitarme\s+(?:la|mi\s+propia)\s+vida|quitarme\s+(?:la|mi\s+propia)\s+vida|(?:acabar|terminar)\s+con\s+mi\s+vida|poner\s+fin\s+a\s+mi\s+vida)\b/giu,
  },
  {
    category: 'self_harm',
    pattern:
      /\b(?:hacerme\s+dano|hacerme\s+cortes|lastimarme|herirme|me\s+har(?:e|ia)\s+dano|me\s+lastimar(?:e|ia)|me\s+herir(?:e|ia)|acabaria\s+haciendome\s+dano|terminaria\s+lastimandome)\b/giu,
  },
  {
    category: 'self_harm',
    pattern:
      /\b(?:me\s+voy\s+a\s+cortar|me\s+(?:quiero|kiero)\s+cortar|voy\s+a\s+cortarme|(?:quiero|kiero)\s+cortarme)\b/giu,
    imminent: true,
    cutting: true,
  },
  {
    category: 'self_harm',
    pattern: /\b(?:cortarme|me\s+cortare|me\s+cortaria)\b/giu,
    cutting: true,
  },
];

const SPANISH_CUTTING_CONTEXT_TOKEN_LIMIT = 6;
const SPANISH_GROOMING_CUTTING_OBJECT =
  /^(?:(?:un\s+poco\s+)?(?:(?:el|la|los|las|mi|mis|un|una|unos|unas)\s+)?(?:pelo|cabello|flequillo|barba|bigote|patillas|perilla|mechon|mechones)(?:\s+(?:corto|corta|cortos|cortas))?(?:\s+de\s+(?:(?:el|la|los|las|mi|mis)\s+)?(?:pelo|cabello))?|(?:(?:las|mis)\s+unas(?:\s+de\s+(?:(?:las|los)\s+)?(?:manos|pies))?|(?:la|mi|una)\s+una(?:\s+rota)?)|(?:(?:las|mis|unas)\s+)?puntas(?:\s+de(?:l|\s+(?:el|mi))\s+(?:pelo|cabello))?|(?:(?:el|un|mi)\s+)?corte\s+de\s+pelo)\b/u;
const SPANISH_HARMLESS_CRAFT_CUTTING_OBJECT =
  /^(?:(?:la|una|mi)\s+tela|(?:el|un|mi)\s+(?:papel|carton|hilo|cesped)|una\s+(?:hoja\s+de\s+papel|cuerda|etiqueta|fotografia)|(?:una|esta)\s+parte\s+del\s+texto)\b/u;
const SPANISH_EXPLICITLY_HARMFUL_CUTTING_CONTEXT =
  /^(?:las\s+(?:venas|munecas)|el\s+(?:brazo|antebrazo)|la\s+piel|para\s+(?:hacerme\s+dano|sangrar)|de\s+verdad|profundamente)\b/u;

function spanishCuttingContextAfter(text: string, end: number) {
  return text
    .slice(end)
    .trimStart()
    .split(/\s+/u)
    .slice(0, SPANISH_CUTTING_CONTEXT_TOKEN_LIMIT)
    .join(' ');
}

function isClearlyHarmlessSpanishCuttingAction(text: string, end: number) {
  const context = spanishCuttingContextAfter(text, end);
  return (
    SPANISH_GROOMING_CUTTING_OBJECT.test(context) ||
    SPANISH_HARMLESS_CRAFT_CUTTING_OBJECT.test(context)
  );
}

function hasExplicitSpanishCuttingHarmContext(text: string, end: number) {
  return SPANISH_EXPLICITLY_HARMFUL_CUTTING_CONTEXT.test(
    spanishCuttingContextAfter(text, end),
  );
}

const SPANISH_COMMITMENT_CUES = [
  /\b(?:ya\s+|finalmente\s+|definitivamente\s+)?(?:he\s+|habia\s+)?decid(?:i|ido|o)\b/giu,
  /\btengo\s+(?:completamente\s+)?decidido\b/giu,
  /\btengo\s+tomada\s+(?:la|una)\s+decision\b/giu,
  /\b(?:tome|he\s+tomado|habia\s+tomado)\s+(?:la|una)\s+(?:firme\s+)?decision\b/giu,
  /\b(?:llegue|he\s+llegado|habia\s+llegado)\s+a\s+(?:la|una)\s+decision\b/giu,
  /\b(?:(?:mi|la)\s+)?decision\s+esta\s+tomada\b/giu,
  /\bestoy\s+(?:(?:completamente|definitivamente)\s+)?decidid[oa]\b/giu,
  /\bestoy\s+(?:(?:plenamente|totalmente|completamente|definitivamente)\s+)?resuelt[oa]\b/giu,
  /\b(?:(?:mi|la)\s+decision\s+definitiva\s+es|(?:resolvi|he\s+resuelto|habia\s+resuelto))\b/giu,
  /\b(?:ya\s+)?lo\s+(?:he\s+)?decid(?:i|ido)\b/giu,
  /\b(?:tengo|he\s+hecho)\s+un\s+plan\b/giu,
  /\bllevo\s+(?:(?:mucho\s+)?tiempo|dias|semanas|meses)\s+(?:planeandolo|pensandolo|preparandolo)\b/giu,
  /\bhace\s+(?:tiempo|dias|semanas|meses)\s+que\s+(?:lo\s+(?:planeo|pienso|preparo)|(?:me\s+)?preparo(?:\s+para)?\s+hacerlo|decidi\s+hacerlo)\b/giu,
  /\blo\s+vengo\s+(?:planeando|pensando|preparando)\b/giu,
  /\b(?:lo\s+)?he\s+estado\s+(?:planeando|planeandolo|pensando|pensandolo|preparando|preparandolo)\b/giu,
  /\b(?:ya\s+)?(?:lo\s+)?tengo\s+planeado\b/giu,
  /\bllevo\s+(?:mucho\s+)?tiempo\s+con\s+este\s+plan\b/giu,
  /\btengo\s+este\s+plan\s+desde\s+hace\s+(?:mucho\s+)?tiempo\b/giu,
  /\bllevo\s+(?:(?:mucho\s+)?tiempo|dias|semanas|meses)\s+preparando\s+(?:esto|lo)\b/giu,
  /\blo\s+preparo\s+desde\s+hace\s+(?:tiempo|dias|semanas|meses)\b/giu,
];

const SPANISH_COMMITMENT_MAX_TOKEN_DISTANCE = 14;

function matchingSpanishSpans(
  text: string,
  patterns: Array<{
    category: SpanishCommittedIntentCategory;
    pattern: RegExp;
    imminent?: boolean;
    cutting?: boolean;
  }>,
): SpanishSignalSpan[] {
  return patterns.flatMap(({ category, pattern, imminent, cutting }) => {
    const matches: SpanishSignalSpan[] = [];
    for (const match of text.matchAll(pattern)) {
      if (match.index === undefined) continue;
      const end = match.index + match[0].length;
      if (cutting && isClearlyHarmlessSpanishCuttingAction(text, end)) {
        continue;
      }
      matches.push({
        category,
        start: match.index,
        end,
        ...(imminent ||
        (cutting && hasExplicitSpanishCuttingHarmContext(text, end))
          ? { imminent: true }
          : {}),
      });
    }
    pattern.lastIndex = 0;
    return matches;
  });
}

function hasNearbySpanishCommitment(
  text: string,
  action: SpanishSignalSpan,
  commitment: SpanishSignalSpan,
) {
  const between =
    action.end <= commitment.start
      ? text.slice(action.end, commitment.start)
      : text.slice(commitment.end, action.start);
  const tokens = between.trim() ? between.trim().split(/\s+/u).length : 0;
  return tokens <= SPANISH_COMMITMENT_MAX_TOKEN_DISTANCE;
}

/**
 * Detect a committed Spanish self-harm intent by combining an explicit,
 * self-directed action with a nearby decision or plan. This intentionally
 * avoids treating decision language alone as a crisis signal.
 */
function spanishCommittedIntent(
  normalizedAndMaskedText: string,
): SpanishCommittedIntentCategory | null {
  const actions = matchingSpanishSpans(
    normalizedAndMaskedText,
    SPANISH_ACTION_PATTERNS,
  );
  const imminentAction = actions.find((action) => action.imminent);
  if (imminentAction) return imminentAction.category;

  const commitments = matchingSpanishSpans(
    normalizedAndMaskedText,
    SPANISH_COMMITMENT_CUES.map((pattern) => ({
      category: 'suicide' as const,
      pattern,
    })),
  );

  for (const action of actions) {
    if (
      commitments.some((commitment) =>
        hasNearbySpanishCommitment(normalizedAndMaskedText, action, commitment),
      )
    ) {
      return action.category;
    }
  }
  return null;
}

export function assessUserInput(input: string): SafetyAssessment {
  const text = normalizedForScreening(input);
  const spanishText = normalizedSpanishForScreening(input);
  const categories = new Set<SafetyCategory>();
  const matches: string[] = [];
  let level: SafetyLevel = 'safe';

  const committedSpanishIntent = spanishCommittedIntent(spanishText);
  if (committedSpanishIntent) {
    categories.add(committedSpanishIntent);
    matches.push('spanish_committed_intent');
    level = 'crisis';
  }

  for (const signal of INPUT_SIGNALS) {
    for (const [pattern, candidate] of [
      ...signal.patterns.map((pattern) => [pattern, text] as const),
      ...(signal.spanishPatterns ?? []).map(
        (pattern) => [pattern, spanishText] as const,
      ),
    ]) {
      const match = pattern.exec(candidate);
      pattern.lastIndex = 0;
      if (!match) continue;
      categories.add(signal.category);
      matches.push(match[0]);
      if (signal.level === 'crisis') level = 'crisis';
      else if (level === 'safe') level = 'concern';
    }
  }

  return {
    level,
    flagged: level !== 'safe',
    categories: [...categories],
    matchedSignals: matches,
  };
}

export function assessModelOutput(output: string): SafetyAssessment {
  const text = normalizedForScreening(output);
  const categories = new Set<SafetyCategory>();
  const matches: string[] = [];

  for (const block of OUTPUT_BLOCKS) {
    for (const pattern of block.patterns) {
      const match = pattern.exec(text);
      pattern.lastIndex = 0;
      if (!match) continue;
      categories.add(block.category);
      matches.push(match[0]);
    }
  }

  return {
    level: categories.size ? 'blocked_output' : 'safe',
    flagged: categories.size > 0,
    categories: [...categories],
    matchedSignals: matches,
  };
}

export const SAFE_CRISIS_REPLY: Record<SafetyLocale, string> = {
  en: 'I’m really glad you told me. I’m concerned that you may not be safe right now. MindPulse isn’t an emergency service, and you shouldn’t have to handle this alone. If you could be in immediate danger, contact local emergency services now or go to a trusted adult nearby. You can also use the support options shown below. Please stay with someone safe while you reach out.',
  ru: 'Спасибо, что рассказал(а) об этом. Я беспокоюсь, что сейчас тебе может быть небезопасно. MindPulse — не экстренная служба, и тебе не нужно справляться с этим в одиночку. Если опасность непосредственная, свяжись с местной экстренной службой или обратись к взрослому, которому доверяешь и который рядом. Ниже есть варианты поддержки. Пожалуйста, побудь рядом с безопасным человеком, пока обращаешься за помощью.',
  // NEEDS NATIVE REVIEW (kk). Until reviewed, kk crisis replies are always
  // delivered together with the Russian text (see crisisRepliesFor).
  kk: 'Маған айтқаның үшін рақмет. Қазір саған қауіпсіз емес болуы мүмкін деп алаңдаймын. MindPulse — жедел жәрдем қызметі емес, және мұнымен жалғыз күресудің қажеті жоқ. Қауіп төніп тұрса, дереу жергілікті жедел қызметке хабарлас немесе жаныңдағы сенімді ересек адамға барыңыз. Төменде қолдау нұсқалары бар. Көмекке жүгінгенде қасыңда қауіпсіз адам болсын.',
  es: 'Gracias por contármelo. Me preocupa que no estés a salvo ahora. MindPulse no es un servicio de emergencias y no tienes que afrontar esto sin ayuda. Si corres peligro inmediato, contacta ahora con los servicios de emergencia de tu zona o con una persona de confianza que esté cerca. Quédate con alguien en un lugar seguro mientras buscas ayuda.',
};

export const SAFE_OUTPUT_FALLBACK: Record<SafetyLocale, string> = {
  en: 'I want to respond in a way that feels supportive and safe, so I’m going to pause that answer. We can slow down together, or you can tell me what kind of support would feel most useful right now.',
  ru: 'Я хочу ответить бережно и безопасно, поэтому остановлю этот ответ. Мы можем немного замедлиться вместе, или ты можешь рассказать, какая поддержка сейчас была бы полезнее всего.',
  // NEEDS NATIVE REVIEW (kk)
  kk: 'Мен қолдау көрсететін және қауіпсіз түрде жауап бергім келеді, сондықтан бұл жауапты тоқтатамын. Бірге баяулай аламыз, немесе қазір қандай қолдау пайдалы болатынын айта аласың.',
  es: 'Quiero responder de una forma segura y que te apoye, así que voy a detener esa respuesta. Podemos ir más despacio o puedes decirme qué tipo de apoyo te serviría más ahora.',
};

const SAFETY_LOCALES: SafetyLocale[] = ['en', 'ru', 'kk', 'es'];

export function toSafetyLocale(value: string | undefined): SafetyLocale {
  return SAFETY_LOCALES.includes(value as SafetyLocale)
    ? (value as SafetyLocale)
    : 'en';
}

/**
 * Crisis replies for a locale. Kazakh has not had native review yet, so kk
 * users receive the Kazakh text together with the Russian text — a safety
 * message must never be readable only in a possibly-flawed translation.
 */
export function crisisRepliesFor(locale: SafetyLocale): string[] {
  if (locale === 'kk') return [SAFE_CRISIS_REPLY.kk, SAFE_CRISIS_REPLY.ru];
  return [SAFE_CRISIS_REPLY[locale]];
}

/** Same dual-language policy as crisisRepliesFor, for blocked model output. */
export function safeOutputFallbacksFor(locale: SafetyLocale): string[] {
  if (locale === 'kk')
    return [SAFE_OUTPUT_FALLBACK.kk, SAFE_OUTPUT_FALLBACK.ru];
  return [SAFE_OUTPUT_FALLBACK[locale]];
}

export { CRISIS_RESOURCES, resourcesForRegion } from './resources';
export type { CrisisResource } from './resources';
