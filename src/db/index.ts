export { getSchemaVersion, LATEST_VERSION, migrate, MIGRATIONS } from './migrations';
export { DATABASE_NAME, DatabaseProvider, openAppDatabase, useDatabase } from './provider';
export * as bookmarks from './repositories/bookmarks';
export * as classrooms from './repositories/classrooms';
export * as notes from './repositories/notes';
export * as recent from './repositories/recent';
export * as teachingLog from './repositories/teaching-log';
export type { BindValue, Database, RunResult } from './types';
export { useDbQuery, type DbQueryState } from './use-db-query';
