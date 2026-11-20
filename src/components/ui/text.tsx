/**
 * The only text component the app should use.
 *
 * It picks the right font automatically:
 * - Hindi (Devanagari) text → Noto Sans Devanagari, with taller line height so matras aren't clipped.
 * - Everything else       → Noto Sans.
 *
 * It also respects the phone's font-size setting (accessibility), capped at 1.6× so
 * layouts don't break at extreme sizes.
 */
import { Children, isValidElement, type ReactNode } from 'react';
import { Text as RNText, type ColorValue, type TextProps as RNTextProps } from 'react-native';

import {
  Colors,
  FontFamily,
  Typography,
  type FontWeightName,
  type TypographyVariant,
} from '@/constants/theme';

const DEVANAGARI = /[ऀ-ॿ]/;

export function containsDevanagari(text: string): boolean {
  return DEVANAGARI.test(text);
}

/** Collects the plain text inside `children` (including nested <Text>) so we can detect the script. */
export function extractText(children: ReactNode): string {
  let result = '';
  Children.forEach(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      result += String(child);
    } else if (isValidElement<{ children?: ReactNode }>(child)) {
      result += extractText(child.props.children);
    }
  });
  return result;
}

export type Script = 'auto' | 'latin' | 'devanagari';

export function resolveFontStyle(
  variant: TypographyVariant,
  options: { weight?: FontWeightName; devanagari: boolean },
) {
  const spec = Typography[variant];
  const families = options.devanagari ? FontFamily.devanagari : FontFamily.latin;
  return {
    fontFamily: families[options.weight ?? spec.weight],
    fontSize: spec.fontSize,
    lineHeight: options.devanagari ? spec.devanagariLineHeight : spec.lineHeight,
  };
}

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  weight?: FontWeightName;
  color?: ColorValue;
  align?: 'left' | 'center' | 'right';
  /** Force a script. Default 'auto' detects Devanagari characters. */
  script?: Script;
};

export function Text({
  variant = 'body',
  weight,
  color = Colors.ink,
  align,
  script = 'auto',
  style,
  children,
  maxFontSizeMultiplier = 1.6,
  ...rest
}: TextProps) {
  const devanagari =
    script === 'devanagari' || (script === 'auto' && containsDevanagari(extractText(children)));

  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[resolveFontStyle(variant, { weight, devanagari }), { color, textAlign: align }, style]}
      {...rest}>
      {children}
    </RNText>
  );
}
