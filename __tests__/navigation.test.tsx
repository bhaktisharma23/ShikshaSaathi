/// <reference types="node" />
/**
 * Loads the real route files from src/app and checks that each tab's screen
 * resolves and shows its honest empty state.
 */
import { screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import path from 'node:path';

const APP_DIR = path.resolve(__dirname, '../src/app');

// The first render compiles every route file, which can take a while on a cold cache.
jest.setTimeout(60_000);

describe('navigation', () => {
  it('opens the Teach tab at "/"', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/' });
    expect(await screen.findByTestId('teach-home')).toBeTruthy();
    expect(screen.getByText('Lessons are being prepared')).toBeTruthy();
  });

  it.each([
    ['/classes', 'classes-home', 'No classes added yet'],
    ['/insights', 'insights-home', 'No results recorded yet'],
    ['/more', 'more-home', 'App language'],
  ])('resolves %s', async (url, testID, text) => {
    await renderRouter(APP_DIR, { initialUrl: url });
    expect(await screen.findByTestId(testID)).toBeTruthy();
    expect(screen.getByText(text)).toBeTruthy();
  });

  it('opens the developer UI kit from More', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/more/ui-kit' });
    expect(await screen.findByText('Typography')).toBeTruthy();
  });
});
