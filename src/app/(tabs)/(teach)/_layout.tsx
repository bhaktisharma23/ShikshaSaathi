import { Stack } from 'expo-router';

import { useStackScreenOptions } from '@/hooks/use-stack-screen-options';

/**
 * Teach tab stack. The anchor keeps Home underneath any screen that is opened directly
 * (e.g. from a link), so "back" always leads somewhere sensible.
 */
export const unstable_settings = { anchor: 'index' };

export default function TeachStackLayout() {
  const screenOptions = useStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      {/* The tab's first screen draws its own large title, so the native header is hidden. */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
