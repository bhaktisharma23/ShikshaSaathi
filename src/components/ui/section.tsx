import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

import { Card } from './card';
import { Text } from './text';

export type SectionProps = {
  title?: string;
  /** Rows are placed in one card with dividers between them. */
  children: ReactNode;
};

/** A titled group of ListRows, like the groups in Android settings. */
export function Section({ title, children }: SectionProps) {
  const items = Children.toArray(children);
  return (
    <View style={styles.section}>
      {title ? (
        <Text variant="caption" weight="semibold" color={Colors.inkMuted} style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      <Card padded={false}>
        {items.map((child, index) => (
          <Fragment key={index}>
            {index > 0 && <View style={styles.divider} />}
            {child}
          </Fragment>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  title: {
    paddingHorizontal: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.line,
    marginLeft: Spacing.lg,
  },
});
