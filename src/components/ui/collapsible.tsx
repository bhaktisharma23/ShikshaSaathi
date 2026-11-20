/**
 * A card with a tappable header that shows or hides its content.
 * Long lesson plans stay short on screen: the teacher opens only the part they need.
 * Closed sections don't render their content at all, which keeps long screens fast.
 */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors, Radius, Spacing, Touch } from '@/constants/theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';

export type CollapsibleProps = {
  title: string;
  icon?: IconName;
  iconColor?: string;
  iconBackground?: string;
  /** Short text under the title, e.g. "10 steps · 120 min". */
  subtitle?: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  testID?: string;
};

export function Collapsible({
  title,
  icon,
  iconColor = Colors.primary,
  iconBackground = Colors.primarySoft,
  subtitle,
  expanded,
  onToggle,
  children,
  testID,
}: CollapsibleProps) {
  return (
    <View style={styles.card} testID={testID}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
        style={({ pressed }) => [styles.header, pressed && { backgroundColor: Colors.surfaceMuted }]}
        testID={testID ? `${testID}-toggle` : undefined}>
        {icon && (
          <View style={[styles.iconWrap, { backgroundColor: iconBackground }]}>
            <Icon name={icon} color={iconColor} />
          </View>
        )}
        <View style={styles.titles}>
          <Text variant="bodyStrong">{title}</Text>
          {subtitle ? (
            <Text variant="caption" color={Colors.inkMuted}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Icon name={expanded ? 'expand_less' : 'expand_more'} color={Colors.inkMuted} />
      </Pressable>
      {expanded && <View style={styles.body}>{children}</View>}
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
  header: {
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
  titles: {
    flex: 1,
    gap: Spacing.xxs,
  },
  body: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
});
