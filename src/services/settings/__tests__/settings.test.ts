import Storage from 'expo-sqlite/kv-store';

import { getSetting, setSetting } from '@/services/settings';

describe('settings', () => {
  beforeEach(async () => {
    await Storage.clear();
  });

  it('returns the default when nothing is saved', () => {
    expect(getSetting('ui.language')).toBe('en');
  });

  it('returns a saved value', async () => {
    await setSetting('ui.language', 'hi');
    expect(getSetting('ui.language')).toBe('hi');
  });

  it('ignores an invalid stored value and falls back to the default', () => {
    Storage.setItemSync('ui.language', 'fr');
    expect(getSetting('ui.language')).toBe('en');
  });
});
