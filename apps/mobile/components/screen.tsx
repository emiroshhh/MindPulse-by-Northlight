import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Text, View } from 'react-native';
import type { ReactNode } from 'react';

export function Screen({
  title,
  subtitle,
  children,
  scroll = true,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
}) {
  const content = (
    <View className="flex-1 px-5 pb-8 pt-3">
      <View className="mb-6">
        <Text className="text-3xl font-semibold tracking-tight text-ink">
          {title}
        </Text>
        {subtitle && (
          <Text className="mt-2 text-base leading-6 text-muted">
            {subtitle}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`rounded-mp border border-black/5 bg-surface p-5 ${className}`}
    >
      {children}
    </View>
  );
}
