import { Tabs } from 'expo-router';
import {
  BookHeart,
  Heart,
  Leaf,
  MessageCircle,
  Shield,
} from 'lucide-react-native';
import { useMindPulse } from '@/lib/state';

export default function TabLayout() {
  const { locale } = useMindPulse();
  const labels =
    locale === 'en'
      ? {
          today: 'Today',
          chat: 'Talk',
          journal: 'Journal',
          exercises: 'Practice',
          profile: 'Safety',
        }
      : {
          today: 'Сегодня',
          chat: 'Чат',
          journal: 'Дневник',
          exercises: 'Практики',
          profile: 'Защита',
        };
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#45675f',
        tabBarInactiveTintColor: '#7b8884',
        tabBarStyle: {
          height: 76,
          paddingBottom: 12,
          paddingTop: 8,
          borderTopColor: '#e7ebe8',
          backgroundColor: '#ffffff',
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: labels.today,
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: labels.chat,
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: labels.journal,
          tabBarIcon: ({ color, size }) => (
            <BookHeart color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: labels.exercises,
          tabBarIcon: ({ color, size }) => <Leaf color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: labels.profile,
          tabBarIcon: ({ color, size }) => <Shield color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
