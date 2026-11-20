/**
 * − value + control. Used later for quick result tallies ("how many answered correctly?"),
 * where typing on a keyboard in the middle of class is slow.
 */
import { StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

import { IconButton } from './icon-button';
import { Text } from './text';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type StepperProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  testID?: string;
};

export function Stepper({ label, value, onChange, min = 0, max = Number.MAX_SAFE_INTEGER, step = 1, testID }: StepperProps) {
  const change = (delta: number) => onChange(clamp(value + delta, min, max));

  return (
    <View
      testID={testID}
      style={styles.row}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max: max === Number.MAX_SAFE_INTEGER ? undefined : max, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'increment') change(step);
        if (event.nativeEvent.actionName === 'decrement') change(-step);
      }}>
      <Text variant="bodyStrong" style={styles.label}>
        {label}
      </Text>
      <IconButton
        icon="remove"
        accessibilityLabel={`${label} −`}
        onPress={() => change(-step)}
        disabled={value <= min}
        testID={testID ? `${testID}-decrement` : undefined}
      />
      <Text variant="title" align="center" style={styles.value}>
        {value}
      </Text>
      <IconButton
        icon="add"
        variant="filled"
        accessibilityLabel={`${label} +`}
        onPress={() => change(step)}
        disabled={value >= max}
        testID={testID ? `${testID}-increment` : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  label: {
    flex: 1,
  },
  value: {
    minWidth: 48,
    color: Colors.ink,
  },
});
