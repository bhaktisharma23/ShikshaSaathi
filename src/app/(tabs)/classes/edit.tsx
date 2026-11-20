import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';

import { EmptyState, LoadingState, Screen } from '@/components/ui';
import { classrooms, useDatabase, useDbQuery, type Database } from '@/db';
import type { ClassroomInput } from '@/domain/classroom';
import { ClassForm } from '@/features/classes/class-form';
import { useT } from '@/i18n';

/** Add a class (no ?id) or edit one (?id=<classId>). */
export default function EditClassScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const t = useT();
  const router = useRouter();
  const db = useDatabase();
  const load = useCallback((database: Database) => (id ? classrooms.getClassroom(database, id) : Promise.resolve(null)), [id]);
  const existing = useDbQuery(load);

  const title = id ? t('classes.form.editTitle') : t('classes.form.newTitle');

  const save = async (input: ClassroomInput) => {
    if (id) await classrooms.updateClassroom(db, id, input);
    else await classrooms.createClassroom(db, input);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title }} />
      <Screen topInset={false} testID="class-edit">
        {id && existing.loading && existing.data === undefined ? (
          <LoadingState />
        ) : id && !existing.data ? (
          <EmptyState icon="error" title={t('classes.notFound.title')} message={t('classes.notFound.message')} />
        ) : (
          <ClassForm initial={existing.data ?? undefined} onSubmit={save} />
        )}
      </Screen>
    </>
  );
}
