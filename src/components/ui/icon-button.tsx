import { Pressable, StyleSheet } from 'react-native';

import { Colors, Radius, Touch } from '@/constants/theme';

import { Icon, type IconName } from './icon';

export type IconButtonProps = {
  icon: IconName;
  /** Required: icon-only buttons have no visible text, so TalkBack needs this. */
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'plain' | 'filled';
  testID?: string;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  disabled = false,
  variant = 'plain',
  testID,
}: IconButtonProps) {
  const filled = variant === 'filled';
  const iconColor = disabled ? Colors.disabled : filled ? Colors.inkInverse : Colors.primary;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={4}
      style={({ pressed }) => [
        styles.base,
        filled && { backgroundColor: disabled ? Colors.surfaceMuted : Colors.primary },
        !filled && { borderColor: Colors.lineStrong, borderWidth: 1, backgroundColor: Colors.surface },
        pressed && !disabled && { opacity: 0.75 },
      ]}>
      <Icon name={icon} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: Touch.min,
    height: Touch.min,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
