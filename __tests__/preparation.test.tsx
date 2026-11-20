/// <reference types="node" />
/**
 * Phase 4 end to end: Preparation Centre, notes, bookmarks and "Mark as taught".
 * Real screens + router + a fresh in-memory SQLite database per renderRouter().
 */
import { act, fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';
import path from 'node:path';

const APP_DIR = path.resolve(__dirname, '../src/app');
jest.setTimeout(60_000);

const go = (href: Parameters<typeof router.push>[0]) => act(async () => router.push(href));

describe('preparation centre', () => {
  it('opens from the topic hub with only the overview open', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/topic/sci-magnets' });
    await fireEvent.press(await screen.findByTestId('open-prepare'));

    expect(await screen.findByTestId('prepare-screen')).toBeTruthy();
    expect(screen.getByText(/Over three periods, students discover magnets/)).toBeTruthy();
    // Closed sections render nothing, keeping the long plan fast.
    expect(screen.queryByTestId('step-1')).toBeNull();
  });

  it('shows teaching steps grouped by period, with board work', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/topic/sci-magnets/prepare' });
    await fireEvent.press(await screen.findByTestId('section-steps-toggle'));

    expect(screen.getByText('Period 1')).toBeTruthy();
    expect(screen.getByText('Period 3')).toBeTruthy();
    expect(screen.getByTestId('step-1')).toBeTruthy();
    expect(screen.getByTestId('step-10')).toBeTruthy();
    expect(screen.getAllByText('On the board').length).toBeGreaterThan(0);
    expect(screen.getByText('10 steps · 120 min')).toBeTruthy();
  });

  it('opens and closes all sections', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/topic/sci-magnets/prepare' });
    await fireEvent.press(await screen.findByTestId('toggle-all'));
    expect(screen.getByText('Close all sections')).toBeTruthy();
    expect(screen.getByText('Common misconceptions')).toBeTruthy();
    expect(screen.getByText('“A magnet attracts all metals.”')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('toggle-all'));
    expect(screen.getByText('Open all sections')).toBeTruthy();
    expect(screen.queryByText('“A magnet attracts all metals.”')).toBeNull();
  });

  it('saves a note under a section and keeps it after leaving the screen', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/topic/sci-magnets' });
    await fireEvent.press(await screen.findByTestId('open-prepare'));
    await fireEvent.press(await screen.findByTestId('section-materials-toggle'));
    await fireEvent.press(screen.getByTestId('add-note-materials'));
    await fireEvent.changeText(screen.getByTestId('note-input-materials'), 'Borrow 3 magnets from the Class 8 lab');
    await fireEvent.press(screen.getByTestId('save-note-materials'));

    expect(await screen.findByText('Borrow 3 magnets from the Class 8 lab')).toBeTruthy();

    await act(async () => router.back());
    await fireEvent.press(await screen.findByTestId('open-prepare'));
    expect(await screen.findByText(/My notes: 1/)).toBeTruthy();
  });
});

describe('bookmarks', () => {
  it('saves a topic and lists it on Home', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/topic/sci-magnets' });
    await fireEvent.press(await screen.findByTestId('bookmark-button'));
    expect(await screen.findByText('Remove from saved topics')).toBeTruthy();

    await act(async () => router.dismissAll());
    expect(await screen.findByTestId('saved-sci-magnets')).toBeTruthy();
  });
});

describe('mark as taught', () => {
  it('records teaching for a class and shows it in the teaching record', async () => {
    // Create a class first through the real Classes screens.
    await renderRouter(APP_DIR, { initialUrl: '/classes/edit' });
    await fireEvent.changeText(await screen.findByTestId('class-name'), '6-A');
    await fireEvent.changeText(screen.getByTestId('class-students'), '38');
    await fireEvent.press(screen.getByTestId('class-save'));

    await go('/topic/sci-magnets');
    expect(await screen.findByText('Not marked as taught yet.')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('mark-taught-button'));

    // The first class is selected by default.
    expect(await screen.findByRole('radio', { name: '6-A' })).toBeChecked();
    await fireEvent.press(screen.getByTestId('taught-save'));

    const entry = await screen.findByTestId('teaching-log-entry');
    expect(entry).toBeTruthy();
    expect(screen.getByText('6-A')).toBeTruthy();
    expect(screen.getByText(/^Taught · /)).toBeTruthy();
  });

  it('suggests "Revision" when the class was already taught this topic', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/classes/edit' });
    await fireEvent.changeText(await screen.findByTestId('class-name'), '6-B');
    await fireEvent.changeText(screen.getByTestId('class-students'), '30');
    await fireEvent.press(screen.getByTestId('class-save'));

    await go('/topic/sci-magnets');
    await fireEvent.press(await screen.findByTestId('mark-taught-button'));
    await fireEvent.press(await screen.findByTestId('taught-save'));
    await screen.findByTestId('teaching-log-entry');

    await fireEvent.press(screen.getByTestId('mark-taught-button'));
    await fireEvent.press(await screen.findByTestId('taught-class-6-B'));
    expect(await screen.findByRole('radio', { name: 'Revision' })).toBeChecked();
  });

  it('refuses a future date', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/topic/sci-magnets/mark-taught' });
    await fireEvent.changeText(await screen.findByTestId('taught-date'), '2999-01-01');
    await fireEvent.press(screen.getByTestId('taught-save'));
    expect(await screen.findByText('The date cannot be in the future.')).toBeTruthy();
  });

  it('works without any classes ("General")', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/topic/sci-magnets' });
    await fireEvent.press(await screen.findByTestId('mark-taught-button'));
    expect(await screen.findByText(/Add your classes in the Classes tab/)).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'No specific class' })).toBeChecked();
    await fireEvent.press(screen.getByTestId('taught-save'));
    expect(await screen.findByText('General')).toBeTruthy();
  });
});
