/**
 * Opens the app database once at start-up, applies migrations, and shares it with every
 * screen through React context (`useDatabase()`).
 *
 * We call expo-sqlite's `openDatabaseAsync` ourselves (instead of <SQLiteProvider>) so the
 * rest of the app depends only on our small `Database` interface, which Jest can replace
 * with a real in-memory SQLite database. Loading and failure get proper screens.
 */
import { openDatabaseAsync } from 'expo-sqlite';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ErrorState, LoadingState } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useT } from '@/i18n';

import { configureConnection, migrate } from './migrations';
import { fromExpoDatabase, type Database } from './types';

export const DATABASE_NAME = 'shikshasaathi.db';

type State = { status: 'loading' } | { status: 'ready'; db: Database } | { status: 'error'; error: Error };

const DatabaseContext = createContext<Database | null>(null);

export async function openAppDatabase(name: string = DATABASE_NAME): Promise<Database> {
  const db = fromExpoDatabase(await openDatabaseAsync(name));
  await configureConnection(db);
  await migrate(db);
  return db;
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    openAppDatabase()
      .then((db) => !cancelled && setState({ status: 'ready', db }))
      .catch((error: unknown) => {
        console.error('[db] failed to open', error);
        if (!cancelled) setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (state.status === 'ready') {
    return <DatabaseContext.Provider value={state.db}>{children}</DatabaseContext.Provider>;
  }

  return (
    <View style={styles.fill}>
      {state.status === 'loading' ? (
        <LoadingState />
      ) : (
        <ErrorState
          title={t('db.error.title')}
          message={t('db.error.message')}
          onRetry={() => {
            setState({ status: 'loading' });
            setAttempt((n) => n + 1);
          }}
        />
      )}
    </View>
  );
}

export function useDatabase(): Database {
  const db = useContext(DatabaseContext);
  if (!db) throw new Error('useDatabase must be used inside <DatabaseProvider>');
  return db;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Colors.paper,
  },
});
