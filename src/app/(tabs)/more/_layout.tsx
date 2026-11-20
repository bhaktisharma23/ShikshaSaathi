import { Stack } from 'expo-router';

import { useStackScreenOptions } from '@/hooks/use-stack-screen-options';

export default function TabStackLayout() {
  const screenOptions = useStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      {/* The tab's first screen draws its own large title, so the native header is hidden. */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
