import { Linking, Pressable, Text, View } from 'react-native';
import {
  ExternalLink,
  Languages,
  LockKeyhole,
  ShieldAlert,
  UserRound,
} from 'lucide-react-native';
import { resourcesForRegion } from '@mindpulse/shared';
import { Card, Screen } from '@/components/screen';
import { useMindPulse } from '@/lib/state';

export default function SafetyScreen() {
  const { locale, setLocale } = useMindPulse();
  const resources = resourcesForRegion('KZ');
  return (
    <Screen
      title={locale === 'en' ? 'Safety & your data' : 'Безопасность и данные'}
      subtitle={
        locale === 'en'
          ? 'MindPulse is a wellbeing tool—not therapy, medical care, or an emergency service.'
          : 'MindPulse помогает поддерживать благополучие, но не заменяет терапию, врача или экстренную службу.'
      }
    >
      <Card className="border-red-200 bg-orange-50">
        <ShieldAlert color="#a44646" size={24} />
        <Text className="mt-4 text-xl font-semibold text-ink">
          {locale === 'en'
            ? 'If you may be in danger'
            : 'Если тебе может угрожать опасность'}
        </Text>
        <Text className="mt-2 leading-6 text-muted">
          {locale === 'en'
            ? 'Move near a safe person and tell a trusted adult clearly that you need help staying safe right now.'
            : 'Подойди к безопасному человеку и прямо скажи взрослому, которому доверяешь, что тебе сейчас нужна помощь.'}
        </Text>
        {resources.map((resource) => (
          <Pressable
            key={resource.id}
            onPress={() => Linking.openURL(resource.url)}
            className="mt-3 flex-row items-center justify-between rounded-2xl bg-white p-4"
          >
            <View className="flex-1">
              <Text className="font-semibold text-ink">
                {resource.name[locale]}
              </Text>
              <Text className="mt-1 text-xs text-muted">
                {resource.availability[locale]}
              </Text>
            </View>
            <ExternalLink color="#56776f" size={17} />
          </Pressable>
        ))}
      </Card>
      <Card className="mt-4">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-sageSoft">
            <Languages color="#56776f" size={19} />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-ink">
              {locale === 'en' ? 'Language' : 'Язык'}
            </Text>
            <Text className="text-xs text-muted">English / Русский</Text>
          </View>
          <View className="flex-row rounded-full bg-canvas p-1">
            {(['en', 'ru'] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => setLocale(item)}
                className={`rounded-full px-3 py-2 ${locale === item ? 'bg-white' : ''}`}
              >
                <Text
                  className={`text-xs font-bold uppercase ${locale === item ? 'text-ink' : 'text-muted'}`}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Card>
      <Card className="mt-4">
        <View className="flex-row gap-3">
          <LockKeyhole color="#56776f" size={20} />
          <View className="flex-1">
            <Text className="font-semibold text-ink">
              {locale === 'en'
                ? 'Privacy in plain language'
                : 'Приватность простыми словами'}
            </Text>
            <Text className="mt-2 leading-6 text-muted">
              {locale === 'en'
                ? 'This demo stores check-ins and journal pages on this device. With Supabase connected, row-level security keeps each account’s records separate.'
                : 'Демо хранит отметки и дневник на этом устройстве. При подключении Supabase защита на уровне строк разделяет записи аккаунтов.'}
            </Text>
          </View>
        </View>
      </Card>
      <Card className="mt-4">
        <View className="flex-row gap-3">
          <UserRound color="#56776f" size={20} />
          <View className="flex-1">
            <Text className="font-semibold text-ink">
              {locale === 'en'
                ? 'Bring in a trusted person'
                : 'Обратись к человеку'}
            </Text>
            <Text className="mt-2 leading-6 text-muted">
              {locale === 'en'
                ? 'A family member, teacher, school counselor, coach, or another safe adult can offer support in the real world.'
                : 'Родственник, учитель, школьный психолог, тренер или другой безопасный взрослый может помочь в реальном мире.'}
            </Text>
          </View>
        </View>
      </Card>
      <Text className="mt-7 text-center text-xs text-muted">
        MindPulse · by Northlight
      </Text>
    </Screen>
  );
}
