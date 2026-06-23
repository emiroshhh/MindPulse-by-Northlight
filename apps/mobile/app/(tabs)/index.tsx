import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LockKeyhole, Sparkles } from 'lucide-react-native';
import { createId, type MoodKey } from '@mindpulse/shared';
import { Screen, Card } from '@/components/screen';
import { useMindPulse } from '@/lib/state';

const MOODS: { key: MoodKey; face: string; en: string; ru: string }[] = [
  { key: 'rough', face: '◡', en: 'Rough', ru: 'Тяжело' },
  { key: 'low', face: '⌒', en: 'Low', ru: 'Грустно' },
  { key: 'okay', face: '—', en: 'Okay', ru: 'Нормально' },
  { key: 'good', face: '◠', en: 'Good', ru: 'Хорошо' },
  { key: 'great', face: '⌣', en: 'Great', ru: 'Отлично' },
];

export default function TodayScreen() {
  const { locale, moods, addMood } = useMindPulse();
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [saved, setSaved] = useState(false);
  const save = () => {
    if (!mood) return;
    addMood({
      id: createId('mood'),
      userId: 'mobile-local',
      mood,
      intensity: 3,
      tags: [],
      createdAt: new Date().toISOString(),
    });
    setMood(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <Screen
      title={
        locale === 'en' ? 'How are you arriving?' : 'С каким ты настроением?'
      }
      subtitle={
        locale === 'en'
          ? 'No right answer. Take one breath and notice.'
          : 'Нет правильного ответа. Вдохни и прислушайся.'
      }
    >
      <Card>
        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-xs font-bold uppercase tracking-widest text-sage">
            {locale === 'en' ? 'Quick check-in' : 'Быстрая отметка'}
          </Text>
          <LockKeyhole color="#66736f" size={16} />
        </View>
        <View className="flex-row justify-between">
          {MOODS.map((item) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: mood === item.key }}
              key={item.key}
              onPress={() => setMood(item.key)}
              className={`items-center rounded-2xl px-2 py-3 ${mood === item.key ? 'bg-sageSoft' : ''}`}
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-canvas">
                <Text className="text-xl font-bold text-ink">{item.face}</Text>
              </View>
              <Text className="mt-2 text-[10px] text-muted">
                {item[locale]}
              </Text>
            </Pressable>
          ))}
        </View>
        {mood && (
          <Pressable
            onPress={save}
            className="mt-5 items-center rounded-full bg-ink px-5 py-4"
          >
            <Text className="font-semibold text-white">
              {locale === 'en' ? 'Save privately' : 'Сохранить приватно'}
            </Text>
          </Pressable>
        )}
        {saved && (
          <Text className="mt-3 text-center text-sm font-medium text-sage">
            {locale === 'en'
              ? 'Saved. That’s enough for now.'
              : 'Сохранено. На сейчас этого достаточно.'}
          </Text>
        )}
      </Card>
      <Card className="mt-4 bg-sageSoft">
        <Sparkles color="#56776f" size={22} />
        <Text className="mt-4 text-xl font-semibold text-ink">
          {locale === 'en'
            ? 'You checked in with yourself'
            : 'Ты прислушиваешься к себе'}
        </Text>
        <Text className="mt-2 leading-6 text-muted">
          {locale === 'en'
            ? `${moods.length} private moments logged. This is awareness, not a score.`
            : `${moods.length} приватных отметок. Это наблюдение, а не оценка.`}
        </Text>
      </Card>
    </Screen>
  );
}
