import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { BookHeart, LockKeyhole, Trash2 } from 'lucide-react-native';
import { createId } from '@mindpulse/shared';
import { Card, Screen } from '@/components/screen';
import { useMindPulse } from '@/lib/state';

export default function JournalScreen() {
  const { locale, journals, addJournal, deleteJournal } = useMindPulse();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const save = () => {
    if (!title.trim() || !body.trim()) return;
    const now = new Date().toISOString();
    addJournal({
      id: createId('journal'),
      userId: 'mobile-local',
      title: title.trim(),
      body: body.trim(),
      createdAt: now,
      updatedAt: now,
    });
    setTitle('');
    setBody('');
  };
  const remove = (id: string) =>
    Alert.alert(
      locale === 'en' ? 'Delete entry?' : 'Удалить запись?',
      locale === 'en'
        ? 'This cannot be undone.'
        : 'Это действие нельзя отменить.',
      [
        { text: locale === 'en' ? 'Cancel' : 'Отмена', style: 'cancel' },
        {
          text: locale === 'en' ? 'Delete' : 'Удалить',
          style: 'destructive',
          onPress: () => deleteJournal(id),
        },
      ],
    );
  return (
    <Screen
      title={locale === 'en' ? 'Private journal' : 'Личный дневник'}
      subtitle={
        locale === 'en'
          ? 'A page with no audience. Write as little or as much as you need.'
          : 'Страница без зрителей. Пиши столько, сколько хочется.'
      }
    >
      <Card>
        <View className="mb-3 flex-row items-center gap-2">
          <LockKeyhole color="#56776f" size={16} />
          <Text className="text-xs font-bold uppercase tracking-widest text-sage">
            {locale === 'en' ? 'Private to you' : 'Видно только тебе'}
          </Text>
        </View>
        <TextInput
          value={title}
          onChangeText={setTitle}
          maxLength={120}
          placeholder={
            locale === 'en'
              ? 'Give this moment a name'
              : 'Дай этому моменту название'
          }
          placeholderTextColor="#88938f"
          className="rounded-2xl bg-canvas px-4 py-3 text-lg font-semibold text-ink"
        />
        <TextInput
          value={body}
          onChangeText={setBody}
          maxLength={20000}
          multiline
          textAlignVertical="top"
          placeholder={
            locale === 'en'
              ? 'What has been taking up space in your mind?'
              : 'Что занимает твои мысли?'
          }
          placeholderTextColor="#88938f"
          className="mt-3 h-44 rounded-2xl bg-canvas px-4 py-3 text-base leading-6 text-ink"
        />
        <Pressable
          disabled={!title.trim() || !body.trim()}
          onPress={save}
          className="mt-4 items-center rounded-full bg-ink px-5 py-4 disabled:opacity-40"
        >
          <Text className="font-semibold text-white">
            {locale === 'en' ? 'Save privately' : 'Сохранить приватно'}
          </Text>
        </Pressable>
      </Card>
      <Text className="mb-3 mt-7 font-semibold text-ink">
        {locale === 'en' ? 'Earlier pages' : 'Предыдущие страницы'}
      </Text>
      {journals.length === 0 ? (
        <Card>
          <BookHeart color="#56776f" size={22} />
          <Text className="mt-3 text-muted">
            {locale === 'en'
              ? 'Your journal begins whenever you’re ready.'
              : 'Твой дневник начнётся, когда ты будешь готов(а).'}
          </Text>
        </Card>
      ) : (
        journals.map((entry) => (
          <Card key={entry.id} className="mb-3">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-ink">
                  {entry.title}
                </Text>
                <Text className="mt-1 text-xs text-muted">
                  {new Intl.DateTimeFormat(locale, {
                    month: 'short',
                    day: 'numeric',
                  }).format(new Date(entry.createdAt))}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Delete entry"
                onPress={() => remove(entry.id)}
                className="p-2"
              >
                <Trash2 color="#a44646" size={17} />
              </Pressable>
            </View>
            <Text className="mt-3 leading-6 text-muted" numberOfLines={4}>
              {entry.body}
            </Text>
          </Card>
        ))
      )}
    </Screen>
  );
}
