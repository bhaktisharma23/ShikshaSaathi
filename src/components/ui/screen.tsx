/**
 * Standard page wrapper. Handles: background colour, safe areas (status bar / notch),
 * scrolling, a consistent page title, max width on tablets, and space for the tab bar.
 */
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';

import { Text } from './text';

export type ScreenProps = {
  children: ReactNode;
  /** Large page title. Leave out on screens that use the native header instead. */
  title?: string;
  subtitle?: string;
  /** Default true. Set false for screens that manage their own scrolling (e.g. long lists). */
  scroll?: boolean;
  /** Default true: adds bottom space so content isn't hidden behind the tab bar. */
  insideTabs?: boolean;
  /** Default true: pad below the status bar. Set false when a native header is shown. */
  topInset?: boolean;
  testID?: string;
};

export function Screen({
  children,
  title,
  subtitle,
  scroll = true,
  insideTabs = true,
  topInset = true,
  testID,
}: ScreenProps) {
  const edges: Edge[] = topInset ? ['top', 'left', 'right'] : ['left', 'right'];
  const bottomPadding = (insideTabs ? BottomTabInset : 0) + Spacing.xl;

  const body = (
    <View style={styles.inner}>
      {title ? (
        <View style={styles.header}>
          <Text variant="display" accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? <Text color={Colors.inkMuted}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView testID={testID} edges={edges} style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
          keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.scrollContent, styles.fill, { paddingBottom: bottomPadding }]}>{body}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    alignItems: 'center',
  },
  fill: {
    flex: 1,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  header: {
    gap: Spacing.xs,
  },
});
