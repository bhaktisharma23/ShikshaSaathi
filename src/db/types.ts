/**
 * The small set of database operations our code uses.
 *
 * Why our own interface instead of using expo-sqlite's SQLiteDatabase everywhere?
 * Repositories only depend on these five methods, so in tests we can pass a real
 * in-memory SQLite database from Node.js (see test-utils/node-sqlite.ts) and check our
 * actual SQL — no phone needed. In the app, `fromExpoDatabase` adapts expo-sqlite.
 */
import type { SQLiteDatabase } from 'expo-sqlite';

export type BindValue = string | number | null;

export type RunResult = { lastInsertRowId: number; changes: number };

export interface Database {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: BindValue[]): Promise<RunResult>;
  getFirstAsync<T>(sql: string, params?: BindValue[]): Promise<T | null>;
  getAllAsync<T>(sql: string, params?: BindValue[]): Promise<T[]>;
  /** Runs `task` atomically: either every write inside it is saved, or none is. */
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

export function fromExpoDatabase(db: SQLiteDatabase): Database {
  return {
    execAsync: (sql) => db.execAsync(sql),
    runAsync: (sql, params = []) => db.runAsync(sql, params),
    getFirstAsync: <T>(sql: string, params: BindValue[] = []) => db.getFirstAsync<T>(sql, params),
    getAllAsync: <T>(sql: string, params: BindValue[] = []) => db.getAllAsync<T>(sql, params),
    withTransactionAsync: (task) => db.withTransactionAsync(task),
  };
}
