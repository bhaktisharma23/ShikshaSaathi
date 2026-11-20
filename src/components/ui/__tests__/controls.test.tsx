import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { Button, clamp, EmptyState, ErrorState, Segmented, Stepper } from '@/components/ui';
import { LanguageProvider } from '@/i18n';

const renderWithLanguage = (ui: ReactElement) => render(<LanguageProvider initialLanguage="en">{ui}</LanguageProvider>);

describe('<Button>', () => {
  it('calls onPress', async () => {
    const onPress = jest.fn();
    await render(<Button label="Start" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Start' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled or loading', async () => {
    const onPress = jest.fn();
    await render(
      <>
        <Button label="Disabled" disabled onPress={onPress} />
        <Button label="Loading" loading onPress={onPress} />
      </>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Disabled' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Loading' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('clamp()', () => {
  it('keeps values within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe('<Stepper>', () => {
  it('increments and decrements within limits', async () => {
    const onChange = jest.fn();
    await render(<Stepper label="Correct" value={3} min={0} max={4} onChange={onChange} testID="s" />);
    await fireEvent.press(screen.getByTestId('s-increment'));
    expect(onChange).toHaveBeenLastCalledWith(4);
    await fireEvent.press(screen.getByTestId('s-decrement'));
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('disables + at the maximum', async () => {
    const onChange = jest.fn();
    await render(<Stepper label="Correct" value={4} min={0} max={4} onChange={onChange} testID="s" />);
    await fireEvent.press(screen.getByTestId('s-increment'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('<Segmented>', () => {
  it('reports the chosen option and marks the selected one', async () => {
    const onChange = jest.fn();
    await render(
      <Segmented
        options={[
          { value: 'en', label: 'English' },
          { value: 'hi', label: 'हिन्दी' },
        ]}
        value="en"
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked();
    await fireEvent.press(screen.getByRole('radio', { name: 'हिन्दी' }));
    expect(onChange).toHaveBeenCalledWith('hi');
  });
});

describe('state components', () => {
  it('EmptyState shows its message and runs its action', async () => {
    const onPress = jest.fn();
    await render(
      <EmptyState icon="inbox" title="Nothing yet" message="Add something" action={{ label: 'Add', onPress }} />,
    );
    expect(screen.getByText('Add something')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Add' }));
    expect(onPress).toHaveBeenCalled();
  });

  it('ErrorState shows a translated retry button', async () => {
    const onRetry = jest.fn();
    await renderWithLanguage(<ErrorState message="Could not load" onRetry={onRetry} />);
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });
});
