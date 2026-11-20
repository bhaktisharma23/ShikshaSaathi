/**
 * Small display blocks used across the lesson plan. Each kind of information has one
 * consistent look, so teachers learn to scan the page:
 * - LabeledText: "You do: …", "Students do: …"
 * - SayThis:     what the teacher can say aloud (warm saffron box)
 * - BoardBox:    what to write on the blackboard (looks like a chalkboard)
 */
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, Text, type IconName } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';

export function LabeledText({ label, icon, children }: { label: string; icon?: IconName; children: ReactNode }) {
  return (
    <View style={styles.labeled}>
      <View style={styles.labelRow}>
        {icon && <Icon name={icon} size={18} color={Colors.inkMuted} />}
        <Text variant="caption" weight="semibold" color={Colors.inkMuted}>
          {label}
        </Text>
      </View>
      <Text>{children}</Text>
    </View>
  );
}

export function SayThis({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.sayThis} accessibilityLabel={`${label}: ${String(children)}`}>
      <View style={styles.labelRow}>
        <Icon name="record_voice_over" size={18} color={Colors.accentInk} />
        <Text variant="caption" weight="semibold" color={Colors.accentInk}>
          {label}
        </Text>
      </View>
      <Text style={styles.italic}>{children}</Text>
    </View>
  );
}

export function BoardBox({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.board}>
      <Text variant="caption" weight="semibold" color={Colors.chalk} style={styles.boardLabel}>
        {label}
      </Text>
      <Text color={Colors.chalk}>{children}</Text>
    </View>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={index} style={styles.bulletRow}>
          <Text color={Colors.primary} weight="bold">
            •
          </Text>
          <Text style={styles.flex}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function NumberedList({ items }: { items: string[] }) {
  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={index} style={styles.bulletRow}>
          <Text color={Colors.primary} weight="bold" style={styles.number}>
            {index + 1}.
          </Text>
          <Text style={styles.flex}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/** A sub-card inside a section (one teaching step, one misconception, …). */
export function ItemCard({ children, testID }: { children: ReactNode; testID?: string }) {
  return (
    <View style={styles.item} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  labeled: {
    gap: Spacing.xxs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sayThis: {
    backgroundColor: Colors.accentSoft,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  italic: {
    fontStyle: 'italic',
  },
  board: {
    backgroundColor: Colors.chalkboard,
    borderRadius: Radius.sm,
    borderWidth: 4,
    borderColor: Colors.chalkboardFrame,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  boardLabel: {
    opacity: 0.85,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    gap: Spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  number: {
    minWidth: 22,
  },
  flex: {
    flex: 1,
  },
  item: {
    backgroundColor: Colors.paper,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.md,
    gap: Spacing.md,
  },
});
