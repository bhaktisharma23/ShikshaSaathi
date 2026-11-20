/// <reference types="node" />
/**
 * Loads the real route files from src/app and checks that screens resolve,
 * show real content (or honest empty states), and that a teacher can reach a topic
 * from Home in two taps.
 */
import { fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import path from 'node:path';

const APP_DIR = path.resolve(__dirname, '../src/app');

// The first render compiles every route file, which can take a while on a cold cache.
jest.setTimeout(60_000);

describe('tabs', () => {
  it('opens the Teach tab at "/" with all five subjects', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/' });
    expect(await screen.findByTestId('teach-home')).toBeTruthy();
    for (const id of ['maths', 'science', 'english', 'hindi', 'social-science']) {
      expect(screen.getByTestId(`subject-card-${id}`)).toBeTruthy();
    }
    // Subjects without content say so honestly instead of showing fake topics.
    expect(screen.getAllByText('In preparation').length).toBe(4);
    expect(screen.getByText('1 topic')).toBeTruthy();
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

describe('teach flow', () => {
  it('reaches a topic from Home in two taps', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/' });
    await fireEvent.press(await screen.findByTestId('subject-card-science'));
    await fireEvent.press(await screen.findByTestId('topic-row-sci-magnets'));
    expect(await screen.findByTestId('topic-sci-magnets')).toBeTruthy();
  });

  it('shows the topic hub with sample notice, objectives and real counts', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/topic/sci-magnets' });
    expect(await screen.findByTestId('sample-notice')).toBeTruthy();
    expect(screen.getByText('Learning objectives')).toBeTruthy();
    expect(screen.getByText('10 teaching steps · 8 materials')).toBeTruthy();
    expect(screen.getByText('4 assessments · 18 questions')).toBeTruthy();
  });

  it('shows an empty state for a subject without topics', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/subject/maths' });
    expect(await screen.findByText('Topics are being prepared')).toBeTruthy();
  });

  it('handles an unknown topic or subject without crashing', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/topic/does-not-exist' });
    expect(await screen.findByText('Topic not found')).toBeTruthy();
    await renderRouter(APP_DIR, { initialUrl: '/subject/astronomy' });
    expect(await screen.findByText('Subject not found')).toBeTruthy();
  });
});
