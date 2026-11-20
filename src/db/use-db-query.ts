/**
 * Loads data from the database for a screen, and loads it again every time the screen
 * comes back into view (e.g. after editing a class and pressing back), so lists are never stale.
 *
 *   const loadClasses = useCallback((db: Database) => listClassrooms(db), []);
 *   const classes = useDbQuery(loadClasses);
 *   if (classes.error) …  if (!classes.data) <LoadingState/> …
 *
 * Wrap the query in useCallback; a new function on every render would reload forever.
 */
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { useDatabase } from './provider';
import type { Database } from './types';

export type DbQueryState<T> = {
  /** Latest successful result. Kept while reloading, so the screen doesn't flash. */
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
  reload: () => Promise<void>;
};

export function useDbQuery<T>(query: (db: Database) => Promise<T>): DbQueryState<T> {
  const db = useDatabase();
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const latestRequest = useRef(0);

  const reload = useCallback(async () => {
    const request = ++latestRequest.current;
    setLoading(true);
    try {
      const result = await query(db);
      if (request === latestRequest.current) {
        setData(result);
        setError(undefined);
      }
    } catch (e) {
      console.error('[db] query failed', e);
      if (request === latestRequest.current) setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  }, [db, query]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { data, error, loading, reload };
}
