import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Feather,
  Leaf,
  Moon,
  Wind,
  X,
} from 'lucide-react-native';
import { EXERCISES, type Exercise } from '@mindpulse/shared';
import { Card, Screen } from '@/components/screen';
import { useMindPulse } from '@/lib/state';

export default function ExercisesScreen() {
  const { locale } = useMindPulse();
  const [active, setActive] = useState<Exercise | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const step = active?.steps[stepIndex];
  useEffect(() => setSeconds(step?.seconds ?? 0), [step]);
  useEffect(() => {
    if (!seconds) return;
    const timer = setInterval(
      () => setSeconds((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [seconds]);
  const open = (exercise: Exercise) => {
    setActive(exercise);
    setStepIndex(0);
  };
  const close = () => setActive(null);
  const icons = [Wind, Leaf, Feather, Moon];
  return (
    <Screen
      title={locale === 'en' ? 'A small reset' : 'Небольшая перезагрузка'}
      subtitle={
        locale === 'en'
          ? 'No score, no streak. Stop whenever you need.'
          : 'Без баллов и серий. Остановись, когда захочешь.'
      }
    >
      {EXERCISES.map((exercise, index) => {
        const Icon = icons[index] ?? Leaf;
        return (
          <Card key={exercise.key} className="mb-4">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-sageSoft">
              <Icon color="#56776f" size={22} />
            </View>
            <Text className="mt-4 text-xl font-semibold text-ink">
              {exercise.title[locale]}
            </Text>
            <Text className="mt-2 leading-6 text-muted">
              {exercise.summary[locale]}
            </Text>
            <View className="mt-4 flex-row items-center justify-between">
              <Text className="text-xs font-semibold text-sage">
                {exercise.minutes} {locale === 'en' ? 'min' : 'мин'}
              </Text>
              <Pressable
                onPress={() => open(exercise)}
                className="rounded-full bg-sageSoft px-5 py-3"
              >
                <Text className="font-semibold text-ink">
                  {locale === 'en' ? 'Begin' : 'Начать'} →
                </Text>
              </Pressable>
            </View>
          </Card>
        );
      })}
      <Modal
        visible={Boolean(active)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={close}
      >
        {active && step && (
          <Screen
            scroll={false}
            title={active.title[locale]}
            subtitle={`${stepIndex + 1} / ${active.steps.length}`}
          >
            <Pressable
              onPress={close}
              className="absolute right-5 top-2 z-10 rounded-full bg-canvas p-3"
            >
              <X color="#1f2d2a" size={20} />
            </Pressable>
            <View className="flex-1 items-center justify-center">
              <View className="h-44 w-44 items-center justify-center rounded-full bg-sageSoft">
                <Text className="text-4xl font-light text-ink">
                  {step.seconds ? seconds || '✓' : stepIndex + 1}
                </Text>
                {step.seconds && (
                  <Text className="mt-1 text-xs text-muted">
                    {locale === 'en' ? 'seconds' : 'секунд'}
                  </Text>
                )}
              </View>
              <Text className="mt-9 text-center text-2xl font-semibold text-ink">
                {step.title[locale]}
              </Text>
              <Text className="mt-3 px-5 text-center text-base leading-7 text-muted">
                {step.body[locale]}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Pressable
                disabled={stepIndex === 0}
                onPress={() => setStepIndex((value) => value - 1)}
                className="flex-row items-center gap-1 rounded-full px-4 py-3 disabled:opacity-30"
              >
                <ChevronLeft color="#56776f" size={18} />
                <Text className="font-semibold text-sage">
                  {locale === 'en' ? 'Back' : 'Назад'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  stepIndex === active.steps.length - 1
                    ? close()
                    : setStepIndex((value) => value + 1)
                }
                className="flex-row items-center gap-1 rounded-full bg-ink px-5 py-3"
              >
                {stepIndex === active.steps.length - 1 && (
                  <Check color="white" size={18} />
                )}
                <Text className="font-semibold text-white">
                  {stepIndex === active.steps.length - 1
                    ? locale === 'en'
                      ? 'Finish'
                      : 'Завершить'
                    : locale === 'en'
                      ? 'Next'
                      : 'Дальше'}
                </Text>
                {stepIndex < active.steps.length - 1 && (
                  <ChevronRight color="white" size={18} />
                )}
              </Pressable>
            </View>
          </Screen>
        )}
      </Modal>
    </Screen>
  );
}
