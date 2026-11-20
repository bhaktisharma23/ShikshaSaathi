import { useMemo } from 'react';

import { Colors, FontFamily } from '@/constants/theme';
import { useLanguage } from '@/i18n';

/**
 * Shared header style for every Stack in the app, so all pushed screens look the same.
 * The header title font follows the UI language (Hindi titles need the Devanagari font).
 */
export function useStackScreenOptions() {
  const { language } = useLanguage();
  return useMemo(
    () => ({
      headerStyle: { backgroundColor: Colors.paper },
      headerShadowVisible: false,
      headerTintColor: Colors.ink,
      headerTitleStyle: {
        fontFamily: language === 'hi' ? FontFamily.devanagari.semibold : FontFamily.latin.semibold,
        color: Colors.ink,
      },
      contentStyle: { backgroundColor: Colors.paper },
    }),
    [language],
  );
}
