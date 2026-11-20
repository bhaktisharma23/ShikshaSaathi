/**
 * Developer-only: runs real database checks ON THE PHONE (Jest tests run on the computer).
 * Nothing is left behind: the write test runs inside a transaction that is rolled back.
 * Check names are in English only because this screen is never shown to teachers.
 */
import { Redirect, Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge, Button, Card, Screen, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { classrooms, getSchemaVersion, LATEST_VERSION, useDatabase, type Database } from '@/db';
import { useT } from '@/i18n';

type CheckResult = { name: string; passed: boolean; detail: string };

class RollbackSignal extends Error {}

async function runChecks(db: Database): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const check = async (name: string, fn: () => Promise<string>) => {
    try {
      results.push({ name, passed: true, detail: await fn() });
    } catch (error) {
      results.push({ name, passed: false, detail: error instanceof Error ? error.message : String(error) });
    }
  };

  await check('Schema is up to date', async () => {
    const version = await getSchemaVersion(db);
    if (version !== LATEST_VERSION) throw new Error(`version ${version}, expected ${LATEST_VERSION}`);
    return `version ${version}`;
  });

  await check('Foreign keys are enforced', async () => {
    const row = await db.getFirstAsync<{ foreign_keys: number }>('PRAGMA foreign_keys');
    if (row?.foreign_keys !== 1) throw new Error('PRAGMA foreign_keys is off');
    return 'on';
  });

  await check('Write, read back, roll back', async () => {
    let createdId = '';
    try {
      await db.withTransactionAsync(async () => {
        const created = await classrooms.createClassroom(db, { name: 'SELF-TEST', studentCount: 1, academicYear: '2026-27' });
        createdId = created.id;
        const readBack = await classrooms.getClassroom(db, created.id);
        if (readBack?.name !== 'SELF-TEST') throw new Error('could not read back the row');
        throw new RollbackSignal();
      });
    } catch (error) {
      if (!(error instanceof RollbackSignal)) throw error;
    }
    if (await classrooms.getClassroom(db, createdId)) throw new Error('rollback did not remove the test row');
    return 'saved, read and removed';
  });

  await check('Invalid data is refused by the database', async () => {
    const now = new Date().toISOString();
    try {
      await db.runAsync(
        `INSERT INTO classrooms (id, name, student_count, academic_year, created_at, updated_at) VALUES ('self-test', 'x', 0, '2026-27', ?, ?)`,
        [now, now],
      );
    } catch {
      return 'student_count = 0 rejected';
    }
    await db.runAsync("DELETE FROM classrooms WHERE id = 'self-test'");
    throw new Error('CHECK constraint did not fire');
  });

  return results;
}

export default function DbSelfTestScreen() {
  const t = useT();
  const db = useDatabase();
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [running, setRunning] = useState(false);

  if (!__DEV__) return <Redirect href="/more" />;

  const run = async () => {
    setRunning(true);
    setResults(await runChecks(db));
    setRunning(false);
  };

  return (
    <>
      <Stack.Screen options={{ title: t('more.dbSelfTest') }} />
      <Screen topInset={false}>
        <Text color={Colors.inkMuted}>{t('more.dbSelfTestHint')}</Text>
        <Button label={t('selfTest.run')} icon="play_arrow" onPress={run} loading={running} testID="run-self-test" />
        {results?.map((r) => (
          <Card key={r.name} testID={`check-${r.passed ? 'pass' : 'fail'}`}>
            <View style={styles.row}>
              <Text variant="bodyStrong" style={styles.flex}>
                {r.name}
              </Text>
              <Badge
                label={r.passed ? t('selfTest.passed') : t('selfTest.failed')}
                tone={r.passed ? 'success' : 'danger'}
                icon={r.passed ? 'check_circle' : 'error'}
              />
            </View>
            <Text variant="caption" color={Colors.inkMuted}>
              {r.detail}
            </Text>
          </Card>
        ))}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  flex: {
    flex: 1,
  },
});
