import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { Button, EmptyState, ErrorState, ListRow, LoadingState, Screen, Section } from '@/components/ui';
import { classrooms, useDbQuery, type Database } from '@/db';
import { useT } from '@/i18n';

/** Classes tab: the teacher's classes. Reloads automatically when you come back to it. */
export default function ClassesScreen() {
  const t = useT();
  const router = useRouter();
  const load = useCallback((db: Database) => classrooms.listClassrooms(db), []);
  const { data, error, reload } = useDbQuery(load);

  const addClass = () => router.push('/classes/edit');

  return (
    <Screen title={t('classes.title')} testID="classes-home">
      {error && !data ? (
        <ErrorState message={t('db.error.message')} onRetry={reload} />
      ) : !data ? (
        <LoadingState />
      ) : data.length === 0 ? (
        <EmptyState
          icon="groups"
          title={t('classes.empty.title')}
          message={t('classes.empty.message')}
          action={{ label: t('classes.add'), icon: 'add', onPress: addClass }}
        />
      ) : (
        <>
          <Button label={t('classes.add')} icon="add" variant="secondary" onPress={addClass} testID="add-class" />
          <Section>
            {data.map((klass) => (
              <ListRow
                key={klass.id}
                icon="groups"
                title={klass.name}
                subtitle={t('classes.summary', { students: klass.studentCount, year: klass.academicYear })}
                onPress={() => router.push({ pathname: '/classes/[classId]', params: { classId: klass.id } })}
                testID={`class-row-${klass.name}`}
              />
            ))}
          </Section>
        </>
      )}
    </Screen>
  );
}
