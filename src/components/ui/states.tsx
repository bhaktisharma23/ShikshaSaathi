/**
 * Empty, error and loading states.
 * Every screen and list must use one of these instead of showing a blank area,
 * so the teacher always knows what is happening and what to do next.
 */
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useT } from '@/i18n';

import { Button } from './button';
import { Icon, type IconName } from './icon';
import { Text } from './text';

export type EmptyStateProps = {
  icon: IconName;
  title: string;
  message: string;
  action?: { label: string; onPress: () => void; icon?: IconName };
  testID?: string;
};

export function EmptyState({ icon, title, message, action, testID }: EmptyStateProps) {
  return (
    <View testID={testID} style={styles.container} accessibilityRole="summary">
      <View style={[styles.iconCircle, { backgroundColor: Colors.primarySoft }]}>
        <Icon name={icon} size={36} color={Colors.primary} />
      </View>
      <Text variant="heading" align="center">
        {title}
      </Text>
      <Text color={Colors.inkMuted} align="center" style={styles.message}>
        {message}
      </Text>
      {action && <Button label={action.label} icon={action.icon} onPress={action.onPress} size="lg" />}
    </View>
  );
}

export type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  testID?: string;
};

export function ErrorState({ title, message, onRetry, testID }: ErrorStateProps) {
  const t = useT();
  return (
    <View testID={testID} style={styles.container} accessibilityRole="alert">
      <View style={[styles.iconCircle, { backgroundColor: Colors.dangerSoft }]}>
        <Icon name="error" size={36} color={Colors.danger} />
      </View>
      <Text variant="heading" align="center">
        {title ?? t('common.errorTitle')}
      </Text>
      <Text color={Colors.inkMuted} align="center" style={styles.message}>
        {message}
      </Text>
      {onRetry && <Button label={t('common.retry')} icon="refresh" variant="secondary" onPress={onRetry} />}
    </View>
  );
}

export function LoadingState({ label }: { label?: string }) {
  const t = useT();
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={label ?? t('common.loading')}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text color={Colors.inkMuted}>{label ?? t('common.loading')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    maxWidth: 420,
    marginBottom: Spacing.sm,
  },
});
