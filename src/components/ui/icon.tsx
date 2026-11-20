/**
 * Icons use Google's Material Symbols on Android (bundled with expo-symbols, so they work offline).
 * Browse names at https://fonts.google.com/icons — the `name` prop is type-checked against that list.
 * On iOS an SF Symbol can be given with `ios`; without it, nothing is drawn there (Android is our target).
 */
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';

export type IconName = AndroidSymbol;

export type IconProps = {
  name: IconName;
  ios?: SFSymbol;
  size?: number;
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, ios, size = 24, color = Colors.ink, style }: IconProps) {
  return (
    <SymbolView
      name={{ android: name, web: name, ios }}
      size={size}
      tintColor={color}
      style={style}
      // Icons are decorative: the button or row around them carries the accessible label.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
