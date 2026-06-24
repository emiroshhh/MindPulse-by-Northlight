export type ProviderName = 'openai' | 'anthropic' | 'mock';

export interface ProviderMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProviderConfig {
  provider: ProviderName;
  apiKey?: string;
  model?: string;
  maxTokens: number;
  systemPrompt: string;
  signal?: AbortSignal;
}

export interface AIProvider {
  stream(
    messages: ProviderMessage[],
    config: ProviderConfig,
  ): AsyncGenerator<string>;
}

async function* parseOpenAI(response: Response) {
  if (!response.ok || !response.body)
    throw new Error(`OpenAI request failed (${response.status})`);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
      try {
        const payload = JSON.parse(line.slice(6)) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const token = payload.choices?.[0]?.delta?.content;
        if (token) yield token;
      } catch {
        /* provider keep-alive event */
      }
    }
  }
}

async function* openAIProvider(
  messages: ProviderMessage[],
  config: ProviderConfig,
) {
  if (!config.apiKey) throw new Error('OPENAI_API_KEY is not configured');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model ?? 'gpt-4o-mini',
      stream: true,
      max_tokens: config.maxTokens,
      temperature: 0.7,
      messages: [{ role: 'system', content: config.systemPrompt }, ...messages],
    }),
    signal: config.signal ?? null,
  });
  yield* parseOpenAI(response);
}

async function* anthropicProvider(
  messages: ProviderMessage[],
  config: ProviderConfig,
) {
  if (!config.apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model ?? 'claude-3-5-haiku-latest',
      stream: true,
      max_tokens: config.maxTokens,
      system: config.systemPrompt,
      messages,
    }),
    signal: config.signal ?? null,
  });
  if (!response.ok || !response.body)
    throw new Error(`Anthropic request failed (${response.status})`);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const payload = JSON.parse(line.slice(6)) as {
          type?: string;
          delta?: { text?: string };
        };
        if (payload.type === 'content_block_delta' && payload.delta?.text)
          yield payload.delta.text;
      } catch {
        /* provider keep-alive event */
      }
    }
  }
}

function localCompanionReply(
  messages: ProviderMessage[],
  config: ProviderConfig,
) {
  const latest = messages.at(-1)?.content.toLocaleLowerCase() ?? '';
  const russian = /respond in russian/i.test(config.systemPrompt);

  if (russian) {
    if (/экзамен|контрольн|уч[её]б|школ/.test(latest))
      return 'Похоже, учёба сейчас занимает слишком много внутреннего пространства. Не нужно разбирать всё сразу: можно выбрать только одну ближайшую задачу и сделать её чуть меньше. Что сейчас давит сильнее всего?';
    if (/сон|уснуть|спать|устал/.test(latest))
      return 'Звучит так, будто телу и голове трудно переключиться в режим отдыха. Можно на минуту приглушить свет, отложить экран и сделать несколько медленных выдохов — без требования сразу уснуть. Хочешь попробовать короткую практику для завершения дня?';
    if (/хорош|отличн|рад|счастлив/.test(latest))
      return 'Здорово, что сегодня было немного светлее. Можно просто заметить, что именно помогло, не превращая это в обязательство повторить идеальный день. Какой момент хочется запомнить?';
    return 'Похоже, сейчас в тебе много всего одновременно. Давай не будем решать всё сразу: можно немного замедлиться и выбрать только одну часть. О чём было бы полезнее всего поговорить первой?';
  }

  if (/exam|test|school|homework|study/.test(latest))
    return 'It sounds like school is taking up a lot of inner space right now. We do not have to untangle everything at once—could we choose the one task making the most noise and make it a little smaller?';
  if (/sleep|tired|wind down|bed/.test(latest))
    return 'It sounds like your mind and body are having trouble switching into rest. You could lower the lights, put the screen aside for one minute, and try a few slower exhales—without demanding that sleep happen immediately. Want a short wind-down practice?';
  if (/good|great|happy|proud/.test(latest))
    return 'I’m glad there was some lightness today. You can simply notice what helped without turning it into a rule for having a “perfect” day. What moment would you like to remember?';
  return 'That sounds like a lot to carry at once. We can make this moment smaller: take one slow breath, let your shoulders drop, and choose just one part. What feels most useful to untangle first?';
}

async function* mockProvider(
  messages: ProviderMessage[],
  config: ProviderConfig,
) {
  const reply = localCompanionReply(messages, config);
  for (const word of reply.split(/(?<=\s)/)) yield word;
}

export const providers: Record<ProviderName, AIProvider> = {
  openai: { stream: openAIProvider },
  anthropic: { stream: anthropicProvider },
  mock: { stream: mockProvider },
};

export function getAIProvider(name: string | undefined): AIProvider {
  if (name === 'anthropic' || name === 'mock') return providers[name];
  return providers.openai;
}
