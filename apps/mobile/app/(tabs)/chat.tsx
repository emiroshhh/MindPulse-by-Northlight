import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { fetch } from 'expo/fetch';
import { Send, ShieldAlert, Sparkles } from 'lucide-react-native';
import {
  SAFE_CRISIS_REPLY,
  assessUserInput,
  createId,
  type ChatMessage,
} from '@mindpulse/shared';
import { Screen, Card } from '@/components/screen';
import { useMindPulse } from '@/lib/state';

export default function ChatScreen() {
  const { locale } = useMindPulse();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        locale === 'en'
          ? 'Hi — what would feel useful to talk through?'
          : 'Привет! Что тебе было бы полезно обсудить?',
      safetyFlag: false,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const send = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setInput('');
    setSending(true);
    const safety = assessUserInput(content);
    if (safety.flagged) setCrisis(true);
    const user: ChatMessage = {
      id: createId('user'),
      role: 'user',
      content,
      safetyFlag: safety.flagged,
      createdAt: new Date().toISOString(),
    };
    const assistantId = createId('assistant');
    setMessages((items) => [
      ...items,
      user,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        safetyFlag: safety.flagged,
        createdAt: new Date().toISOString(),
      },
    ]);
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      if (!baseUrl) throw new Error('API base URL missing');
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          sessionId: 'demo-mobile',
          locale,
          history: messages
            .slice(-10)
            .map(({ role, content: text }) => ({ role, content: text })),
        }),
      });
      if (!response.ok || !response.body)
        throw new Error('Companion unavailable');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let complete = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';
        for (const raw of events) {
          const type = raw.match(/^event: (.+)$/m)?.[1];
          const data = raw.match(/^data: (.+)$/m)?.[1];
          if (!data) continue;
          const payload = JSON.parse(data) as {
            token?: string;
            crisis?: boolean;
          };
          if (payload.crisis) setCrisis(true);
          if (type === 'token' && payload.token) {
            complete += payload.token;
            setMessages((items) =>
              items.map((item) =>
                item.id === assistantId ? { ...item, content: complete } : item,
              ),
            );
          }
        }
      }
    } catch {
      setMessages((items) =>
        items.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                content: safety.flagged
                  ? SAFE_CRISIS_REPLY[locale]
                  : locale === 'en'
                    ? 'I cannot connect right now. Please try again when you’re ready.'
                    : 'Сейчас не получается подключиться. Попробуй ещё раз, когда будешь готов(а).',
              }
            : item,
        ),
      );
    } finally {
      setSending(false);
    }
  };
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen
        scroll={false}
        title={locale === 'en' ? 'Talk to MindPulse' : 'Поговорить с MindPulse'}
        subtitle={
          locale === 'en'
            ? 'Supportive, non-clinical, and never a crisis service.'
            : 'Поддержка без лечения; это не экстренная служба.'
        }
      >
        {crisis && (
          <Card className="mb-3 border-red-200 bg-orange-50">
            <View className="flex-row gap-3">
              <ShieldAlert color="#a44646" size={21} />
              <View className="flex-1">
                <Text className="font-semibold text-ink">
                  {locale === 'en'
                    ? 'You deserve support now'
                    : 'Тебе нужна поддержка сейчас'}
                </Text>
                <Text className="mt-1 text-sm leading-5 text-muted">
                  {locale === 'en'
                    ? 'Please move near a safe adult and open the Safety tab for current resources.'
                    : 'Подойди к безопасному взрослому и открой вкладку «Защита» с актуальными ресурсами.'}
                </Text>
              </View>
            </View>
          </Card>
        )}
        <Card className="flex-1 p-0">
          <ScrollView
            ref={scroll}
            onContentSizeChange={() =>
              scroll.current?.scrollToEnd({ animated: true })
            }
            contentContainerClassName="gap-4 p-4"
          >
            {messages.map((message) => (
              <View
                key={message.id}
                className={`max-w-[84%] rounded-3xl px-4 py-3 ${message.role === 'user' ? 'self-end rounded-br-md bg-ink' : 'self-start rounded-bl-md bg-sageSoft'}`}
              >
                <Text
                  className={`leading-6 ${message.role === 'user' ? 'text-white' : 'text-ink'}`}
                >
                  {message.content || '•••'}
                </Text>
              </View>
            ))}
          </ScrollView>
          <View className="flex-row items-end gap-2 border-t border-black/5 p-3">
            <TextInput
              accessibilityLabel="Message"
              multiline
              value={input}
              onChangeText={setInput}
              placeholder={
                locale === 'en' ? 'What’s on your mind?' : 'О чём ты думаешь?'
              }
              placeholderTextColor="#88938f"
              className="max-h-28 flex-1 rounded-2xl bg-canvas px-4 py-3 text-ink"
            />
            <Pressable
              accessibilityLabel="Send message"
              disabled={!input.trim() || sending}
              onPress={send}
              className="h-12 w-12 items-center justify-center rounded-full bg-ink disabled:opacity-40"
            >
              <Send color="white" size={18} />
            </Pressable>
          </View>
        </Card>
        <View className="mt-2 flex-row items-center justify-center gap-1">
          <Sparkles color="#66736f" size={12} />
          <Text className="text-[10px] text-muted">
            {locale === 'en' ? 'AI can make mistakes' : 'ИИ может ошибаться'}
          </Text>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
