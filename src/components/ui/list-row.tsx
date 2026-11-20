import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors, Radius, Spacing, Touch } from '@/constants/theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';

export type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconColor?: string;
  iconBackground?: string;
  /** Custom content on the right (e.g. a Badge). If omitted and onPress is set, a chevron is shown. */
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityHint?: string;
  testID?: string;
};

export function ListRow({
  title,
  subtitle,
  icon,
  iconColor = Colors.primary,
  iconBackground = Colors.primarySoft,
  trailing,
  onPress,
  accessibilityHint,
  testID,
}: ListRowProps) {
  const content = (
    <>
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: iconBackground }]}>
          <Icon name={icon} color={iconColor} />
        </View>
      )}
      <View style={styles.text}>
        <Text variant="bodyStrong">{title}</Text>
        {subtitle ? (
          <Text variant="caption" color={Colors.inkMuted}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ?? (onPress ? <Icon name="chevron_right" color={Colors.inkMuted} /> : null)}
    </>
  );

  if (!onPress) {
    return (
      <View testID={testID} style={styles.row}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: Colors.surfaceMuted }]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: Touch.comfortable,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: Spacing.xxs,
  },
});
