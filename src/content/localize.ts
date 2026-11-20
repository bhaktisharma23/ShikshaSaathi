import { useCallback } from 'react';

import { useLanguage, type Language } from '@/i18n';

import type { LocalizedText } from './schema';

/**
 * Picks the text for the current language. Hindi content is optional while drafting,
 * so when Hindi is missing we fall back to English rather than showing nothing.
 */
export function localize(text: LocalizedText, language: Language): string {
  return language === 'hi' && text.hi ? text.hi : text.en;
}

/** `const L = useLocalize(); L(topic.title)` */
export function useLocalize() {
  const { language } = useLanguage();
  return useCallback((text: LocalizedText) => localize(text, language), [language]);
}
