import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MindPulseProvider } from '@/lib/state';

export default function RootLayout() {
  return (
    <MindPulseProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </MindPulseProvider>
  );
}
