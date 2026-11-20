/**
 * Labelled text input with hint and error message.
 * The label sits above the box (not inside it) so it stays visible while typing —
 * easier for teachers who are not used to forms.
 */
import { useState } from 'react';
import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { Colors, FontFamily, Radius, Spacing, Touch, Typography } from '@/constants/theme';

import { containsDevanagari, Text } from './text';

export type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  hint?: string;
  /** When set, the field is outlined in red and the message is read out by TalkBack. */
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  autoFocus?: boolean;
  /** Several lines of text (e.g. notes). The box grows from about 4 lines tall. */
  multiline?: boolean;
  testID?: string;
};

export function TextField({
  label,
  value,
  onChangeText,
  hint,
  error,
  keyboardType,
  maxLength,
  autoFocus,
  multiline = false,
  testID,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const devanagari = containsDevanagari(value);

  return (
    <View style={styles.field}>
      <Text variant="label">{label}</Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoFocus={autoFocus}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        maxFontSizeMultiplier={1.6}
        placeholderTextColor={Colors.inkMuted}
        style={[
          styles.input,
          {
            fontFamily: devanagari ? FontFamily.devanagari.regular : FontFamily.latin.regular,
            borderColor: error ? Colors.danger : focused ? Colors.primary : Colors.lineStrong,
            borderWidth: focused || error ? 2 : 1,
          },
          multiline && styles.multiline,
        ]}
      />
      {error ? (
        <Text variant="caption" color={Colors.danger} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color={Colors.inkMuted}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.xs,
  },
  input: {
    minHeight: Touch.comfortable,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    fontSize: Typography.body.fontSize,
    color: Colors.ink,
  },
  multiline: {
    minHeight: 112,
    paddingTop: Spacing.md,
  },
});
