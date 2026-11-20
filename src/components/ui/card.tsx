import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

export type CardProps = {
  children: ReactNode;
  /** When provided the whole card becomes one large touch target. */
  onPress?: () => void;
  accessibilityLabel?: string;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * A white surface with a thin border. We use borders instead of drop shadows:
 * they look calmer and cost nothing to render on low-end phones.
 */
export function Card({ children, onPress, accessibilityLabel, padded = true, style, testID }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          styles.card,
          padded && styles.padded,
          pressed && { backgroundColor: Colors.surfaceMuted },
          style,
        ]}>
        {children}
      </Pressable>
    );
  }
  return (
    <View testID={testID} style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
  },
  padded: {
    padding: Spacing.lg,
  },
});
