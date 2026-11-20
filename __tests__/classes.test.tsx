/// <reference types="node" />
/**
 * Classes flow, end to end: real screens + router + a real in-memory SQLite database.
 * Every renderRouter() starts with a fresh, empty database.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import path from 'node:path';
import { Alert, type AlertButton } from 'react-native';

const APP_DIR = path.resolve(__dirname, '../src/app');
jest.setTimeout(60_000);

async function addClass(name: string, students: string, year?: string) {
  await fireEvent.changeText(await screen.findByTestId('class-name'), name);
  await fireEvent.changeText(screen.getByTestId('class-students'), students);
  if (year !== undefined) await fireEvent.changeText(screen.getByTestId('class-year'), year);
  await fireEvent.press(screen.getByTestId('class-save'));
}

describe('classes', () => {
  it('starts empty, adds a class, and lists it', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/classes' });
    expect(await screen.findByText('No classes added yet')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Add a class' }));
    await addClass('6-A', '38', '2026-27');

    expect(await screen.findByTestId('class-row-6-A')).toBeTruthy();
    expect(screen.getByText('38 students · 2026-27')).toBeTruthy();
  });

  it('shows field errors and saves nothing when the form is invalid', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/classes/edit' });
    await addClass('', '0', '2026');

    expect(await screen.findByText('Please fill this in.')).toBeTruthy();
    expect(screen.getByText('Enter a whole number from 1 to 200.')).toBeTruthy();
    expect(screen.getByText(/Write the year like \d{4}-\d{2}\./)).toBeTruthy();
    expect(screen.getByTestId('class-edit')).toBeTruthy(); // still on the form
  });

  it('edits a class from its detail screen', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/classes' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Add a class' }));
    await addClass('6-A', '38');

    await fireEvent.press(await screen.findByTestId('class-row-6-A'));
    expect(await screen.findByTestId('class-detail')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('class-edit-button'));

    // Form is pre-filled with the saved values.
    const nameInput = await screen.findByTestId('class-name');
    expect(nameInput.props.value).toBe('6-A');
    await addClass('6-B', '40');

    // Back on the detail screen, which reloads when it regains focus.
    expect(await screen.findByText('40')).toBeTruthy();
    const { router } = require('expo-router');
    await waitFor(() => router.back());
    expect(await screen.findByTestId('class-row-6-B')).toBeTruthy();
    expect(screen.queryByTestId('class-row-6-A')).toBeNull();
  });

  it('deletes a class after confirmation', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons?: AlertButton[]) => {
      buttons?.find((b) => b.style === 'destructive')?.onPress?.();
    });
    await renderRouter(APP_DIR, { initialUrl: '/classes' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Add a class' }));
    await addClass('6-C', '25');
    await fireEvent.press(await screen.findByTestId('class-row-6-C'));
    await fireEvent.press(await screen.findByTestId('class-delete-button'));

    expect(alertSpy).toHaveBeenCalledWith('Delete 6-C?', 'The class will be removed from your list.', expect.any(Array));
    expect(await screen.findByText('No classes added yet')).toBeTruthy();
    alertSpy.mockRestore();
  });

  it('shows "not found" for a class that does not exist', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/classes/no-such-class' });
    expect(await screen.findByText('Class not found')).toBeTruthy();
  });
});

describe('continue where you left off', () => {
  it('lists a topic on Home after it has been opened', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/' });
    expect(await screen.findByTestId('teach-home')).toBeTruthy();
    expect(screen.queryByText('Continue where you left off')).toBeNull();

    await fireEvent.press(screen.getByTestId('subject-card-science'));
    await fireEvent.press(await screen.findByTestId('topic-row-sci-magnets'));
    expect(await screen.findByTestId('topic-sci-magnets')).toBeTruthy();

    // Back to the Home screen (it reloads on focus).
    const { router } = require('expo-router');
    await waitFor(() => router.dismissAll());
    expect(await screen.findByTestId('continue-sci-magnets')).toBeTruthy();
  });
});

describe('database self-test screen', () => {
  it('passes every check against a real SQLite database', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/more/db-self-test' });
    await fireEvent.press(await screen.findByTestId('run-self-test'));
    await waitFor(() => expect(screen.getAllByTestId('check-pass')).toHaveLength(4));
    expect(screen.queryByTestId('check-fail')).toBeNull();
  });
});
