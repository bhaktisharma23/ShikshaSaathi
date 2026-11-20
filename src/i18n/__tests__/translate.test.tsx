import { fireEvent, render, screen } from '@testing-library/react-native';
import Storage from 'expo-sqlite/kv-store';
import { Pressable, Text } from 'react-native';

import { LanguageProvider, translate, useLanguage, useT } from '@/i18n';
import { en } from '@/i18n/strings/en';
import { hi } from '@/i18n/strings/hi';

describe('translate()', () => {
  it('returns the English string', () => {
    expect(translate('en', 'tabs.teach')).toBe('Teach');
  });

  it('returns the Hindi string', () => {
    expect(translate('hi', 'tabs.teach')).toBe('पढ़ाएँ');
  });

  it('fills {placeholders}', () => {
    expect(translate('en', 'more.version', { version: '1.2.3' })).toBe('Version 1.2.3');
    expect(translate('hi', 'more.version', { version: '1.2.3' })).toBe('संस्करण 1.2.3');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(translate('en', 'more.version', {})).toBe('Version {version}');
  });
});

describe('Hindi dictionary', () => {
  it('has a non-empty translation for every English key', () => {
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(hi[key]?.trim().length).toBeGreaterThan(0);
    }
  });

  it('keeps the same placeholders as English', () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(placeholders(hi[key])).toBe(placeholders(en[key]));
    }
  });
});

function LanguageProbe() {
  const t = useT();
  const { setLanguage } = useLanguage();
  return (
    <>
      <Text>{t('tabs.classes')}</Text>
      <Pressable accessibilityRole="button" onPress={() => setLanguage('hi')}>
        <Text>switch</Text>
      </Pressable>
    </>
  );
}

describe('LanguageProvider', () => {
  it('switches language and saves the choice on the device', async () => {
    await render(
      <LanguageProvider initialLanguage="en">
        <LanguageProbe />
      </LanguageProvider>,
    );
    expect(screen.getByText('Classes')).toBeTruthy();

    await fireEvent.press(screen.getByText('switch'));

    expect(await screen.findByText('कक्षाएँ')).toBeTruthy();
    expect(Storage.getItemSync('ui.language')).toBe('hi');
  });
});
