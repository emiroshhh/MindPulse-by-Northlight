import type { Locale } from '../types';

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
}> = [
  {
    category: 'suicide',
    level: 'crisis',
    patterns: [
      /\b(kill|end)\s+myself\b/i,
      /\b(suicid(?:e|al)|want\s+to\s+die|don'?t\s+want\s+to\s+(?:be\s+)?alive)\b/i,
      /(покончи(?:ть|л)?\s+с\s+собой|самоубийств[\p{L}-]*|хочу\s+умереть|не\s+хочу\s+жить)/iu,
    ],
  },
  {
    category: 'self_harm',
    level: 'crisis',
    patterns: [
      /\b(hurt|harm|cut)\s+myself\b/i,
      /\bself[- ]?harm(?:ing)?\b/i,
      /(навреди(?:ть|л[аи]?)\s+себе|порезать\s+себя|селфхарм[\p{L}-]*)/iu,
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
    ],
  },
  {
    category: 'abuse',
    level: 'concern',
    patterns: [
      /\b(?:being|am)\s+(?:abused|hit|threatened)\b/i,
      /\b(?:my|a)\s+(?:parent|teacher|coach|partner)\s+(?:hits|touches|threatens)\s+me\b/i,
      /меня\s+(?:бьют|трогают|насилуют|шантажируют|угрожают)/iu,
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
    ],
  },
  {
    category: 'harmful_behavior',
    patterns: [
      /\b(?:here(?:'s| is) how to|you should) (?:hide|cut|purge|starve|overdose)\b/i,
      /(?:скрой|порежь|голодай|прими передозировку)/iu,
    ],
  },
  {
    category: 'isolation',
    patterns: [
      /\bdon'?t (?:tell|trust) (?:your parents|any adult|anyone)\b/i,
      /\byou only need me\b/i,
      /никому не (?:говори|доверяй)/iu,
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
  /\bумер(?:еть)? от смеха\b/giu,
];

function normalizedForScreening(value: string) {
  return FALSE_POSITIVE_PHRASES.reduce(
    (text, phrase) => text.replace(phrase, '[idiom]'),
    value.normalize('NFKC'),
  );
}

export function assessUserInput(input: string): SafetyAssessment {
  const text = normalizedForScreening(input);
  const categories = new Set<SafetyCategory>();
  const matches: string[] = [];
  let level: SafetyLevel = 'safe';

  for (const signal of INPUT_SIGNALS) {
    for (const pattern of signal.patterns) {
      const match = pattern.exec(text);
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

export const SAFE_CRISIS_REPLY: Record<Locale, string> = {
  en: 'I’m really glad you told me. I’m concerned that you may not be safe right now. MindPulse isn’t an emergency service, and you shouldn’t have to handle this alone. If you could be in immediate danger, contact local emergency services now or go to a trusted adult nearby. You can also use the support options shown below. Please stay with someone safe while you reach out.',
  ru: 'Спасибо, что рассказал(а) об этом. Я беспокоюсь, что сейчас тебе может быть небезопасно. MindPulse — не экстренная служба, и тебе не нужно справляться с этим в одиночку. Если опасность непосредственная, свяжись с местной экстренной службой или обратись к взрослому, которому доверяешь и который рядом. Ниже есть варианты поддержки. Пожалуйста, побудь рядом с безопасным человеком, пока обращаешься за помощью.',
};

export const SAFE_OUTPUT_FALLBACK: Record<Locale, string> = {
  en: 'I want to respond in a way that feels supportive and safe, so I’m going to pause that answer. We can slow down together, or you can tell me what kind of support would feel most useful right now.',
  ru: 'Я хочу ответить бережно и безопасно, поэтому остановлю этот ответ. Мы можем немного замедлиться вместе, или ты можешь рассказать, какая поддержка сейчас была бы полезнее всего.',
};

export { CRISIS_RESOURCES, resourcesForRegion } from './resources';
export type { CrisisResource } from './resources';
