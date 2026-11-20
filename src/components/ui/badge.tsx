import { StyleSheet, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';

export type BadgeTone = 'neutral' | 'primary' | 'accent' | 'success' | 'danger' | 'info';

const TONES: Record<BadgeTone, { background: string; text: string }> = {
  neutral: { background: Colors.surfaceMuted, text: Colors.inkMuted },
  primary: { background: Colors.primarySoft, text: Colors.primary },
  accent: { background: Colors.accentSoft, text: Colors.accentInk },
  success: { background: Colors.successSoft, text: Colors.success },
  danger: { background: Colors.dangerSoft, text: Colors.danger },
  info: { background: Colors.infoSoft, text: Colors.info },
};

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
};

/** Small status label, e.g. "Sample", "Verified". Always text (+ optional icon), never colour alone. */
export function Badge({ label, tone = 'neutral', icon }: BadgeProps) {
  const palette = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      {icon && <Icon name={icon} size={16} color={palette.text} />}
      <Text variant="caption" weight="semibold" color={palette.text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.pill,
  },
});
