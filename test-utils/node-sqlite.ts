/// <reference types="node" />
/**
 * A real SQLite database for Jest, using the SQLite engine built into Node.js (v22.5+).
 * It implements the same methods our app uses from expo-sqlite, so tests run our real
 * SQL, constraints and migrations — only the storage is in memory instead of a phone file.
 *
 * Test-only: this file is outside src/ and is never bundled into the app.
 */
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

import type { BindValue, Database, RunResult } from '../src/db/types';

export function createNodeDatabase(): Database & { close(): void } {
  const db = new DatabaseSync(':memory:');
  const bind = (params: BindValue[] = []) => params as SQLInputValue[];
  // node:sqlite returns objects without a prototype; spread them into plain objects for Jest's equality checks.
  const plain = <T>(row: unknown) => ({ ...(row as object) }) as T;

  return {
    async execAsync(sql) {
      db.exec(sql);
    },
    async runAsync(sql, params): Promise<RunResult> {
      const result = db.prepare(sql).run(...bind(params));
      return { lastInsertRowId: Number(result.lastInsertRowid), changes: Number(result.changes) };
    },
    async getFirstAsync<T>(sql: string, params?: BindValue[]) {
      const row = db.prepare(sql).get(...bind(params));
      return row === undefined ? null : plain<T>(row);
    },
    async getAllAsync<T>(sql: string, params?: BindValue[]) {
      return db.prepare(sql).all(...bind(params)).map((row) => plain<T>(row));
    },
    async withTransactionAsync(task) {
      db.exec('BEGIN');
      try {
        await task();
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
    close() {
      db.close();
    },
  };
}
