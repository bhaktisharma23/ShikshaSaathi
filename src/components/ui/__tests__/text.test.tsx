import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Text } from '@/components/ui';
import { containsDevanagari, extractText, resolveFontStyle } from '@/components/ui/text';
import { FontFamily, Typography } from '@/constants/theme';

describe('containsDevanagari()', () => {
  it('detects Hindi', () => {
    expect(containsDevanagari('संज्ञा')).toBe(true);
    expect(containsDevanagari('Class 6 – कक्षा')).toBe(true);
  });
  it('is false for English and numbers', () => {
    expect(containsDevanagari('Fractions 1/2')).toBe(false);
  });
});

describe('extractText()', () => {
  it('collects text from nested children', () => {
    expect(extractText(['a', 1, <Text key="x">नमस्ते</Text>])).toBe('a1नमस्ते');
  });
});

describe('resolveFontStyle()', () => {
  it('uses Noto Sans and normal line height for Latin text', () => {
    expect(resolveFontStyle('body', { devanagari: false })).toEqual({
      fontFamily: FontFamily.latin.regular,
      fontSize: Typography.body.fontSize,
      lineHeight: Typography.body.lineHeight,
    });
  });
  it('uses Noto Sans Devanagari with taller line height for Hindi', () => {
    const style = resolveFontStyle('title', { devanagari: true });
    expect(style.fontFamily).toBe(FontFamily.devanagari.bold);
    expect(style.lineHeight).toBe(Typography.title.devanagariLineHeight);
  });
  it('honours a weight override', () => {
    expect(resolveFontStyle('body', { devanagari: false, weight: 'bold' }).fontFamily).toBe(FontFamily.latin.bold);
  });
});

describe('<Text>', () => {
  it('automatically picks the Devanagari font for Hindi children', async () => {
    await render(<Text testID="t">पढ़ाएँ</Text>);
    const style = StyleSheet.flatten(screen.getByTestId('t').props.style);
    expect(style.fontFamily).toBe(FontFamily.devanagari.regular);
  });
});
