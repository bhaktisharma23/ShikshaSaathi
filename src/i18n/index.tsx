/**
 * Minimal translation system (no external library needed for two languages).
 *
 *   const t = useT();
 *   t('more.version', { version: '1.0.0' })  // → "Version 1.0.0" or "संस्करण 1.0.0"
 *
 * The chosen language is saved with the settings service, so it is remembered
 * after the app is closed.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { getSetting, setSetting } from '@/services/settings';

import { en, type StringKey } from './strings/en';
import { hi } from './strings/hi';
import type { Language } from './types';

export type { StringKey } from './strings/en';
export type { Language } from './types';
export { LANGUAGES } from './types';

const DICTIONARIES: Record<Language, Record<StringKey, string>> = { en, hi };

export type TranslateParams = Record<string, string | number>;

/** Pure function so it can be unit-tested without React. */
export function translate(language: Language, key: StringKey, params?: TranslateParams): string {
  const template = DICTIONARIES[language][key] ?? en[key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  /** Mainly for tests; normally read from saved settings. */
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(
    () => initialLanguage ?? getSetting('ui.language'),
  );

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    void setSetting('ui.language', next);
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside <LanguageProvider>');
  }
  return context;
}

/** Returns a `t(key, params?)` function bound to the current language. */
export function useT() {
  const { language } = useLanguage();
  return useCallback(
    (key: StringKey, params?: TranslateParams) => translate(language, key, params),
    [language],
  );
}
