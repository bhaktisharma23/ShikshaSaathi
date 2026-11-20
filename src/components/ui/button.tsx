import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Radius, Spacing, Touch } from '@/constants/theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  disabled?: boolean;
  /** Shows a spinner and blocks presses (e.g. while saving). */
  loading?: boolean;
  fullWidth?: boolean;
  /** Read by TalkBack when the visible label is not descriptive enough. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const VARIANTS: Record<
  ButtonVariant,
  { background: string; pressed: string; text: string; border?: string }
> = {
  primary: { background: Colors.primary, pressed: Colors.primaryPressed, text: Colors.inkInverse },
  secondary: {
    background: Colors.surface,
    pressed: Colors.surfaceMuted,
    text: Colors.primary,
    border: Colors.lineStrong,
  },
  ghost: { background: 'transparent', pressed: Colors.primarySoft, text: Colors.primary },
  danger: { background: Colors.danger, pressed: Colors.dangerPressed, text: Colors.inkInverse },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: ButtonProps) {
  const palette = VARIANTS[variant];
  const inactive = disabled || loading;
  const textColor = inactive && variant !== 'ghost' && variant !== 'secondary' ? Colors.inkInverse : palette.text;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        { minHeight: size === 'lg' ? Touch.comfortable : Touch.min },
        {
          backgroundColor: inactive
            ? variant === 'primary' || variant === 'danger'
              ? Colors.disabled
              : palette.background
            : pressed
              ? palette.pressed
              : palette.background,
          borderColor: palette.border ?? 'transparent',
          opacity: inactive && (variant === 'ghost' || variant === 'secondary') ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          icon && <Icon name={icon} size={size === 'lg' ? 24 : 20} color={textColor} />
        )}
        <Text variant="label" color={textColor} numberOfLines={2} align="center">
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
});
