/**
 * Database migrations ("upgrades").
 *
 * SQLite stores a number called `user_version` inside the database file. It starts at 0.
 * On every app start we compare it with the newest migration here and run only the
 * migrations the phone hasn't run yet — each inside a transaction, so a failure halfway
 * leaves the database exactly as it was. This is the approach shown in the expo-sqlite docs.
 *
 * To change the schema later: add 002-….ts, append it to MIGRATIONS. Never edit old ones.
 */
import type { Database } from '../types';

import { migration001 } from './001-initial';

export type Migration = {
  version: number;
  name: string;
  sql: string;
};

export const MIGRATIONS: readonly Migration[] = [migration001];

export const LATEST_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;

export async function getSchemaVersion(db: Database): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  return row?.user_version ?? 0;
}

/** Applies pending migrations. Returns the versions that were applied (empty if up to date). */
export async function migrate(db: Database, migrations: readonly Migration[] = MIGRATIONS): Promise<number[]> {
  assertOrdered(migrations);
  const current = await getSchemaVersion(db);
  const latest = migrations.at(-1)?.version ?? 0;

  if (current > latest) {
    // The database was created by a NEWER app version (e.g. app downgraded). Refuse rather than corrupt it.
    throw new Error(`Database version ${current} is newer than this app supports (${latest}). Please update the app.`);
  }

  const applied: number[] = [];
  for (const migration of migrations) {
    if (migration.version <= current) continue;
    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.sql);
      // PRAGMA cannot use bound parameters; version is a trusted integer from our own code.
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
    applied.push(migration.version);
  }
  return applied;
}

function assertOrdered(migrations: readonly Migration[]) {
  migrations.forEach((m, i) => {
    if (m.version !== i + 1) throw new Error(`Migration "${m.name}" must have version ${i + 1}, found ${m.version}`);
  });
}

/** Connection settings that must be applied every time the database is opened. */
export async function configureConnection(db: Database): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
}
