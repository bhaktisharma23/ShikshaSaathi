/**
 * App preferences, stored on the device with expo-sqlite's key-value store.
 *
 * Why a wrapper instead of calling Storage directly everywhere?
 * - Keys are typed, so a typo like 'ui.langauge' is a compile error.
 * - Values are validated when read, so a corrupted value falls back to a safe default
 *   instead of crashing the app.
 * - If we ever change storage technology, only this file changes.
 */
import Storage from 'expo-sqlite/kv-store';

import type { Language } from '@/i18n/types';

type SettingsSchema = {
  'ui.language': Language;
};

const DEFAULTS: SettingsSchema = {
  'ui.language': 'en',
};

const VALIDATORS: { [K in keyof SettingsSchema]: (raw: string) => raw is SettingsSchema[K] } = {
  'ui.language': (raw): raw is Language => raw === 'en' || raw === 'hi',
};

export type SettingKey = keyof SettingsSchema;

/** Reads a setting synchronously (safe to call during the first render). */
export function getSetting<K extends SettingKey>(key: K): SettingsSchema[K] {
  try {
    const raw = Storage.getItemSync(key);
    if (raw !== null && VALIDATORS[key](raw)) {
      return raw;
    }
  } catch (error) {
    console.warn(`[settings] could not read "${key}"`, error);
  }
  return DEFAULTS[key];
}

/** Saves a setting. Failures are logged, never thrown, so the UI keeps working. */
export async function setSetting<K extends SettingKey>(key: K, value: SettingsSchema[K]): Promise<void> {
  try {
    await Storage.setItem(key, value);
  } catch (error) {
    console.warn(`[settings] could not save "${key}"`, error);
  }
}
