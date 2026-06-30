// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { chatCopyFor, copyFor, getToolsForLanguage } from './i18n';

describe('copyFor', () => {
  it('returns English copy by default', () => {
    const copy = copyFor('en');
    expect(copy.heroTitle).toContain('calmer');
    expect(copy.navLogin).toBe('Log in');
  });

  it('returns Russian copy for "ru"', () => {
    const copy = copyFor('ru');
    expect(copy.heroTitle).toContain('Спокойное');
    expect(copy.navLogin).toBe('Войти');
    expect(copy.navDashboard).toBe('Главная');
    expect(copy.toolOpenLabel).toBe('Открыть →');
  });

  it('returns Kazakh copy for "kk"', () => {
    const copy = copyFor('kk');
    expect(copy.heroTitle).toContain('Шуылдаған');
    expect(copy.navLogin).toBe('Кіру');
    expect(copy.navDashboard).toBe('Басты бет');
    expect(copy.toolOpenLabel).toBe('Құралды ашу →');
  });

  it('falls back to English for an unknown language code', () => {
    const copy = copyFor('fr');
    expect(copy.navLogin).toBe('Log in');
    expect(copy.heroBuiltBy).toContain('student');
  });

  it('Russian footer note is not in English', () => {
    const ru = copyFor('ru');
    const en = copyFor('en');
    expect(ru.footerNote).not.toBe(en.footerNote);
    expect(ru.footerNote).toContain('MindPulse');
  });

  it('Kazakh footer note is not in English', () => {
    const kk = copyFor('kk');
    const en = copyFor('en');
    expect(kk.footerNote).not.toBe(en.footerNote);
  });

  it('featureCards has 3 entries in every language', () => {
    expect(copyFor('en').featureCards).toHaveLength(3);
    expect(copyFor('ru').featureCards).toHaveLength(3);
    expect(copyFor('kk').featureCards).toHaveLength(3);
  });

  it('agentPrompts has 3 entries in every language', () => {
    expect(copyFor('en').agentPrompts).toHaveLength(3);
    expect(copyFor('ru').agentPrompts).toHaveLength(3);
    expect(copyFor('kk').agentPrompts).toHaveLength(3);
  });

  it('Russian tool page labels are in Russian', () => {
    const copy = copyFor('ru');
    expect(copy.toolPageBack).toBe('Назад на главную');
    expect(copy.toolPageGuestAccess).toBe('Гостевой доступ');
  });

  it('Kazakh tool page labels are in Kazakh', () => {
    const copy = copyFor('kk');
    expect(copy.toolPageBack).toBe('Басты бетке оралу');
    expect(copy.toolPageGuestAccess).toBe('Қонақ қолжетімділігі');
  });
});

describe('chatCopyFor', () => {
  it('returns English send label by default', () => {
    expect(chatCopyFor('en').send).toBe('Send');
  });

  it('returns Russian send label', () => {
    expect(chatCopyFor('ru').send).toBe('Отправить');
    expect(chatCopyFor('ru').chooseMode).toBe('Выбери режим');
  });

  it('returns Kazakh send label', () => {
    expect(chatCopyFor('kk').send).toBe('Жіберу');
    expect(chatCopyFor('kk').chooseMode).toBe('Режимді таңдаңыз');
  });

  it('falls back to English for unknown language', () => {
    expect(chatCopyFor('de').send).toBe('Send');
  });

  it('safety note is present in all languages', () => {
    expect(chatCopyFor('en').safetyNote).toContain('MindPulse');
    expect(chatCopyFor('ru').safetyNote).toContain('MindPulse');
    expect(chatCopyFor('kk').safetyNote).toContain('MindPulse');
  });
});

describe('getToolsForLanguage', () => {
  it('returns 6 tools for every language', () => {
    expect(getToolsForLanguage('en')).toHaveLength(6);
    expect(getToolsForLanguage('ru')).toHaveLength(6);
    expect(getToolsForLanguage('kk')).toHaveLength(6);
  });

  it('preserves tool id, route, and iconId regardless of language', () => {
    const ids = ['study', 'planner', 'motivation', 'habit', 'goal', 'reflection'];
    for (const lang of ['en', 'ru', 'kk']) {
      const tools = getToolsForLanguage(lang);
      expect(tools.map((t) => t.id)).toEqual(ids);
      expect(tools.every((t) => typeof t.route === 'string')).toBe(true);
      expect(tools.every((t) => typeof t.iconId === 'string')).toBe(true);
    }
  });

  it('English tools have English study title', () => {
    const tools = getToolsForLanguage('en');
    const study = tools.find((t) => t.id === 'study');
    expect(study?.title).toBe('Study Help');
  });

  it('Russian tools have Russian study title', () => {
    const tools = getToolsForLanguage('ru');
    const study = tools.find((t) => t.id === 'study');
    expect(study?.title).toBe('Помощь в учёбе');
  });

  it('Kazakh tools have Kazakh study title', () => {
    const tools = getToolsForLanguage('kk');
    const study = tools.find((t) => t.id === 'study');
    expect(study?.title).toBe('Оқу көмегі');
  });

  it('Russian planner has Russian examples', () => {
    const tools = getToolsForLanguage('ru');
    const planner = tools.find((t) => t.id === 'planner');
    expect(planner?.examples[0]).toContain('Распланируй');
  });

  it('Kazakh habit tool has Kazakh copy', () => {
    const tools = getToolsForLanguage('kk');
    const habit = tools.find((t) => t.id === 'habit');
    expect(habit?.copy).toContain('студенттік');
  });

  it('falls back to English tools for unknown language', () => {
    const tools = getToolsForLanguage('fr');
    const study = tools.find((t) => t.id === 'study');
    expect(study?.title).toBe('Study Help');
  });
});

describe('authChecking and agentNeedLogin strings', () => {
  it('copyFor English has authChecking', () => {
    expect(copyFor('en').authChecking).toContain('Checking');
  });

  it('copyFor Russian has authChecking in Russian', () => {
    expect(copyFor('ru').authChecking).toContain('сессию');
  });

  it('copyFor Kazakh has authChecking in Kazakh', () => {
    expect(copyFor('kk').authChecking).toContain('тексерілуде');
  });

  it('agentNeedLogin present in all languages', () => {
    expect(copyFor('en').agentNeedLogin).toContain('Sign in');
    expect(copyFor('ru').agentNeedLogin).toContain('Войдите');
    expect(copyFor('kk').agentNeedLogin).toContain('кіріңіз');
  });

  it('chatCopyFor includes authChecking in all languages', () => {
    expect(chatCopyFor('en').authChecking).toContain('Checking');
    expect(chatCopyFor('ru').authChecking).toContain('сессию');
    expect(chatCopyFor('kk').authChecking).toContain('тексерілуде');
  });
});
