// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => {
  const usage = new Map<string, number>();
  let historyWrites = 0;
  const prepare = vi.fn((query: string) => ({
    bind: (...values: unknown[]) => ({
      run: vi.fn(async () => {
        if (query.includes('INSERT INTO daily_usage')) {
          const id = String(values[0]);
          const limit = Number(values[values.length - 1]);
          const current = usage.get(id) ?? 0;
          if (current >= limit) return { success: true, meta: { changes: 0 } };
          usage.set(id, current + 1);
          return { success: true, meta: { changes: 1 } };
        }
        if (query.includes('INSERT INTO chat_messages')) historyWrites += 1;
        return { success: true, meta: { changes: 1 } };
      }),
      first: vi.fn(async () => {
        if (query.includes('SELECT message_count FROM daily_usage')) {
          return { message_count: usage.get(String(values[0])) ?? 0 };
        }
        return null;
      }),
      all: vi.fn(async () => ({ success: true, results: [] })),
    }),
  }));
  return {
    getCurrentUser: vi.fn(),
    getCurrentUserFromRequest: vi.fn(),
    getBindings: vi.fn().mockResolvedValue({}),
    getAuthDb: vi.fn().mockResolvedValue({ prepare }),
    requireDb: vi.fn().mockResolvedValue({ prepare }),
    json: (body: unknown, status = 200) =>
      Response.json(body, {
        status,
        headers: { 'Cache-Control': 'no-store' },
      }),
    prepare,
    usage,
    get historyWrites() {
      return historyWrites;
    },
    resetUsage() {
      usage.clear();
      historyWrites = 0;
    },
  };
});

vi.mock('../../../lib/server/auth', () => authMocks);

import { GET, POST } from './route';
import { copyFor } from '../../../lib/mindpulse/i18n';

const request = (body: unknown) =>
  new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'cf-connecting-ip': '203.0.113.10',
      'user-agent': 'vitest-agent',
    },
    body: JSON.stringify(body),
  });

function mockGemini(reply = 'A clear answer') {
  vi.stubEnv('GEMINI_API_KEY', 'test-key');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ output_text: reply }), {
          status: 200,
        }),
      ),
    ),
  );
}

beforeEach(() => {
  authMocks.getCurrentUser.mockResolvedValue({
    id: 'user-1',
    email: 'student@example.com',
    name: 'Student',
    created_at: '2026-01-01T00:00:00.000Z',
  });
  authMocks.getCurrentUserFromRequest.mockResolvedValue({
    id: 'user-1',
    email: 'student@example.com',
    name: 'Student',
    created_at: '2026-01-01T00:00:00.000Z',
  });
  authMocks.getAuthDb.mockResolvedValue({ prepare: authMocks.prepare });
  authMocks.requireDb.mockResolvedValue({ prepare: authMocks.prepare });
  authMocks.resetUsage();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  authMocks.getCurrentUser.mockReset();
  authMocks.getCurrentUserFromRequest.mockReset();
  authMocks.prepare.mockClear();
  authMocks.resetUsage();
});

describe('/api/chat', () => {
  it('allows guest chat under limit without saving account history', async () => {
    authMocks.getCurrentUserFromRequest.mockResolvedValueOnce(null);
    mockGemini('Guest answer');
    const response = await POST(
      request({ message: 'Explain photosynthesis', mode: 'study' }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      reply: 'Guest answer',
      usage: { limit: 5, used: 1, remaining: 4, accountRequired: true },
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(authMocks.historyWrites).toBe(0);
  });

  it('returns 429 for guest after the daily limit and does not call Gemini', async () => {
    authMocks.getCurrentUserFromRequest.mockResolvedValue(null);
    mockGemini('Guest answer');
    for (let index = 0; index < 5; index += 1) {
      const response = await POST(
        request({ message: `Guest message ${index}`, mode: 'study' }),
      );
      expect(response.status).toBe(200);
    }
    const response = await POST(
      request({ message: 'Guest message over limit', mode: 'study' }),
    );
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({
      error: 'daily_limit_reached',
      limit: 5,
      accountRequired: true,
      remaining: 0,
    });
    expect(fetch).toHaveBeenCalledTimes(5);
    expect(authMocks.historyWrites).toBe(0);
  });

  it('validates the request', async () => {
    expect((await POST(request({ message: ' ' }))).status).toBe(400);
    expect((await POST(request({ message: 'x'.repeat(1001) }))).status).toBe(
      400,
    );
    expect(GET(new Request('http://localhost/api/chat')).status).toBe(405);
  });

  it('returns Spanish request validation messages', async () => {
    const missing = await POST(request({ message: ' ', language: 'es' }));
    expect(await missing.json()).toEqual({
      error: 'El mensaje es obligatorio',
    });
    const long = await POST(
      request({ message: 'x'.repeat(1001), language: 'es' }),
    );
    expect(await long.json()).toEqual({
      error: 'El mensaje debe tener 1.000 caracteres o menos',
    });
  });

  it('requires a server-side Gemini key', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const response = await POST(
      request({ message: 'Explain photosynthesis', mode: 'study' }),
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'missing_key' });
  });

  it('allows logged-in users under limit and saves account history', async () => {
    mockGemini('A clear answer');
    const response = await POST(
      request({ message: 'Explain photosynthesis', mode: 'study' }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      reply: 'A clear answer',
      usage: { limit: 20, used: 1, remaining: 19, accountRequired: false },
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1beta/interactions'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-goog-api-key': 'test-key' }),
      }),
    );
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(JSON.parse(String(init?.body))).toMatchObject({
      model: 'gemini-3.5-flash',
      system_instruction: expect.stringContaining('MindPulse'),
      input: 'Explain photosynthesis',
      generation_config: { temperature: 0.5 },
    });
    expect(authMocks.historyWrites).toBe(1);
  });

  it('does not let exhausted guest quota block a valid session', async () => {
    authMocks.getCurrentUserFromRequest.mockResolvedValue(null);
    mockGemini('Guest answer');
    for (let index = 0; index < 5; index += 1) {
      const response = await POST(
        request({ message: `Guest quota fill ${index}`, mode: 'study' }),
      );
      expect(response.status).toBe(200);
    }
    expect(
      (await POST(request({ message: 'Guest over limit', mode: 'study' })))
        .status,
    ).toBe(429);

    authMocks.getCurrentUserFromRequest.mockResolvedValue({
      id: 'user-1',
      email: 'student@example.com',
      name: 'Student',
      created_at: '2026-01-01T00:00:00.000Z',
    });
    const response = await POST(
      request({ message: 'Account after guest limit', mode: 'study' }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      reply: 'Guest answer',
      usage: { limit: 20, used: 1, remaining: 19, accountRequired: false },
    });
    expect(authMocks.historyWrites).toBe(1);
  });

  it('returns 429 for logged-in users after the daily limit and does not call Gemini', async () => {
    mockGemini('Account answer');
    for (let index = 0; index < 20; index += 1) {
      const response = await POST(
        request({ message: `Account message ${index}`, mode: 'study' }),
      );
      expect(response.status).toBe(200);
    }
    const response = await POST(
      request({ message: 'Account message over limit', mode: 'study' }),
    );
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({
      error: 'daily_limit_reached',
      limit: 20,
      accountRequired: false,
      remaining: 0,
    });
    expect(fetch).toHaveBeenCalledTimes(20);
    expect(authMocks.historyWrites).toBe(20);
  });

  it('returns a localized crisis reply with resources without calling the provider or consuming quota', async () => {
    mockGemini('should never be sent');
    const response = await POST(
      request({ message: 'Я хочу умереть', mode: 'study', language: 'ru' }),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      reply: string;
      crisis: boolean;
      resources: Array<{ name: string; url: string }>;
    };
    expect(body.crisis).toBe(true);
    expect(body.reply).toContain('MindPulse — не экстренная служба');
    expect(body.reply).not.toContain('emergency service');
    expect(body.resources.length).toBeGreaterThan(0);
    expect(
      body.resources.every((item) => item.url.startsWith('https://')),
    ).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
    expect(authMocks.usage.size).toBe(0);
    expect(authMocks.historyWrites).toBe(0);
  });

  it('pairs Kazakh crisis replies with Russian until native review', async () => {
    mockGemini('should never be sent');
    const response = await POST(
      request({ message: 'өлгім келеді', mode: 'study', language: 'kk' }),
    );
    const body = (await response.json()) as { reply: string; crisis: boolean };
    expect(body.crisis).toBe(true);
    expect(body.reply).toContain('жедел жәрдем қызметі емес');
    expect(body.reply).toContain('не экстренная служба');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('routes flexible Spanish crisis phrases, including Next Action wrappers, around AI and quota', async () => {
    mockGemini('should never be sent');
    const russianResponse = await POST(
      request({
        message: 'Я хочу покончить с собой',
        mode: 'study',
        language: 'ru',
      }),
    );
    const russianBody = (await russianResponse.json()) as { crisis: boolean };

    expect(russianResponse.status).toBe(200);
    expect(russianBody.crisis).toBe(true);

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
    const requestPrompt = copyFor('es').nextAction.requestPrompt;
    for (const phrase of serious) {
      const variants = [
        phrase,
        phrase.toLocaleLowerCase('es'),
        phrase.toLocaleUpperCase('es'),
        phrase
          .normalize('NFD')
          .replace(/\p{M}+/gu, '')
          .normalize('NFC'),
        phrase.replace(/[^\p{L}\p{N}\s]/gu, ''),
        phrase.replace(/\s+/g, '   '),
        `¿${phrase}?!`,
        `Necesito decirte algo con sinceridad: ${phrase}`,
        `${phrase} Por favor, escúchame.`,
      ];
      for (const variant of variants) {
        for (const message of [variant, requestPrompt(variant)]) {
          const response = await POST(
            request({ message, mode: 'study', language: 'es' }),
          );
          const body = (await response.json()) as {
            crisis: boolean;
            reply: string;
          };
          expect(response.status, message).toBe(200);
          expect(body.crisis, message).toBe(true);
          expect(body.reply, message).toContain(
            'no es un servicio de emergencias',
          );
        }
      }
    }

    expect(fetch).not.toHaveBeenCalled();
    expect(authMocks.usage.size).toBe(0);
    expect(authMocks.historyWrites).toBe(0);

    const harmless = [
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
    ];
    for (const message of harmless) {
      authMocks.resetUsage();
      const response = await POST(
        request({ message, mode: 'study', language: 'es' }),
      );
      const body = (await response.json()) as { crisis?: boolean };
      expect(response.status, message).toBe(200);
      expect(body.crisis, message).not.toBe(true);
    }
    expect(fetch).toHaveBeenCalledTimes(harmless.length);

    vi.mocked(fetch).mockClear();
    authMocks.resetUsage();
    for (const message of [
      'Necesito ayuda urgente, estoy en peligro.',
      'Necesito ayuda inmediata porque quiero matarme.',
      'Necesito ayuda urgente, alguien me está haciendo daño.',
      'Necesito ayuda inmediata, me van a matar.',
      'Necesito ayuda urgente porque he decidido suicidarme.',
      'Necesito ayuda inmediata, no estoy a salvo.',
    ]) {
      const response = await POST(
        request({ message, mode: 'study', language: 'es' }),
      );
      const body = (await response.json()) as { crisis?: boolean };
      expect(response.status, message).toBe(200);
      expect(body.crisis, message).toBe(true);
    }
    expect(fetch).not.toHaveBeenCalled();
    expect(authMocks.usage.size).toBe(0);
    expect(authMocks.historyWrites).toBe(0);
  });

  it('scopes crisis resources to the caller region without assuming Kazakhstan', async () => {
    mockGemini('should never be sent');
    const kzRequest = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cf-ipcountry': 'KZ',
      },
      body: JSON.stringify({
        message: 'I want to kill myself',
        mode: 'study',
        language: 'en',
      }),
    });
    const kzBody = (await (await POST(kzRequest)).json()) as {
      resources: Array<{ id: string }>;
    };
    expect(kzBody.resources.map((item) => item.id)).toContain(
      'kz-government-emergency',
    );

    const elsewhereBody = (await (
      await POST(request({ message: 'I want to kill myself', mode: 'study' }))
    ).json()) as { resources: Array<{ id: string }> };
    expect(elsewhereBody.resources.map((item) => item.id)).toEqual([
      'international-find-a-helpline',
    ]);
  });

  it('replaces unsafe model output with a localized fallback', async () => {
    mockGemini('You definitely have depression.');
    const response = await POST(
      request({ message: 'Помоги с планом', mode: 'planner', language: 'ru' }),
    );
    const body = (await response.json()) as { reply: string };
    expect(body.reply).toContain('бережно и безопасно');
    expect(body.reply).not.toContain('depression');
  });

  it('returns the upstream status without exposing the key', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response('{"error":"bad model"}', { status: 400 }),
        ),
    );
    const response = await POST(
      request({ message: 'Explain photosynthesis', mode: 'study' }),
    );
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'gemini_request_failed',
      status: 400,
    });
    expect(errorSpy).toHaveBeenCalledWith(
      '[MindPulse] Gemini request failed:',
      { status: 400 },
    );
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain('bad model');
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain('test-key');
  });

  it('does not log provider exception messages', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('provider body must stay private')),
    );

    const response = await POST(
      request({ message: 'Help me plan', mode: 'planner' }),
    );
    expect(response.status).toBe(502);
    expect(errorSpy).toHaveBeenCalledWith('[MindPulse] Gemini unavailable:', {
      name: 'Error',
    });
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain(
      'provider body must stay private',
    );
  });
});

describe('Gemini interaction assembly', () => {
  it('system_instruction sent to Gemini contains MindPulse identity and mode content', async () => {
    mockGemini('A clear answer');
    const response = await POST(
      request({
        message: 'Help me plan today',
        mode: 'planner',
        language: 'en',
      }),
    );
    expect(response.status).toBe(200);
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    const instruction = body.system_instruction as string;
    expect(instruction).toContain('MindPulse');
    expect(instruction).toContain('Daily Planner');
    expect(instruction).toContain('fallback');
  });

  it('passes bounded recent conversation context to Gemini', async () => {
    mockGemini('A contextual answer');
    await POST(
      request({
        message: 'What should I do next?',
        mode: 'planner',
        language: 'en',
        history: [
          { role: 'user', content: 'I have an essay due Friday.' },
          { role: 'assistant', content: 'Start with the outline.' },
        ],
      }),
    );
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(body.input).toContain('Student: I have an essay due Friday.');
    expect(body.input).toContain('MindPulse: Start with the outline.');
    expect(body.input).toContain(
      'Current student message:\nWhat should I do next?',
    );
  });

  it('generation_config uses temperature 0.5', async () => {
    mockGemini('answer');
    await POST(request({ message: 'Hello', mode: 'study', language: 'en' }));
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(body.generation_config).toMatchObject({ temperature: 0.5 });
  });
});
