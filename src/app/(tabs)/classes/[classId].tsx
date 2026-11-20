import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, Card, EmptyState, ErrorState, LoadingState, Screen, Section, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { classrooms, useDatabase, useDbQuery, type Database } from '@/db';
import { useT } from '@/i18n';

/** One class: details, edit/delete, and (from Phase 7) its assessment history. */
export default function ClassDetailScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const t = useT();
  const router = useRouter();
  const db = useDatabase();
  const load = useCallback(
    async (database: Database) => {
      const klass = await classrooms.getClassroom(database, classId);
      return klass ? { klass, sessions: await classrooms.countCompletedSessions(database, classId) } : null;
    },
    [classId],
  );
  const { data, error, loading, reload } = useDbQuery(load);

  if (error && data === undefined) {
    return (
      <Screen topInset={false}>
        <ErrorState message={t('db.error.message')} onRetry={reload} />
      </Screen>
    );
  }
  if (loading && data === undefined) {
    return (
      <Screen topInset={false}>
        <LoadingState />
      </Screen>
    );
  }
  if (!data) {
    return (
      <Screen topInset={false}>
        <EmptyState
          icon="error"
          title={t('classes.notFound.title')}
          message={t('classes.notFound.message')}
          action={{ label: t('common.goBack'), icon: 'arrow_back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  const { klass, sessions } = data;

  const confirmDelete = () => {
    Alert.alert(
      t('classes.delete.title', { name: klass.name }),
      sessions > 0 ? t('classes.delete.messageWithResults', { count: sessions }) : t('classes.delete.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await classrooms.deleteClassroom(db, klass.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: klass.name }} />
      <Screen topInset={false} testID="class-detail">
        <Card>
          <View style={styles.details}>
            <Detail label={t('classes.detail.students')} value={String(klass.studentCount)} />
            <Detail label={t('classes.detail.year')} value={klass.academicYear} />
            {klass.schoolName ? <Detail label={t('classes.detail.school')} value={klass.schoolName} /> : null}
          </View>
        </Card>

        <View style={styles.actions}>
          <Button
            label={t('common.edit')}
            icon="edit"
            variant="secondary"
            onPress={() => router.push({ pathname: '/classes/edit', params: { id: klass.id } })}
            testID="class-edit-button"
          />
          <Button label={t('classes.delete')} icon="delete" variant="ghost" onPress={confirmDelete} testID="class-delete-button" />
        </View>

        <Section title={t('classes.detail.history')}>
          <EmptyState icon="history" title={t('classes.detail.noHistory.title')} message={t('classes.detail.noHistory.message')} />
        </Section>
      </Screen>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text color={Colors.inkMuted}>{label}</Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  details: {
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
});
