import { randomUUID } from 'expo-crypto';

/** New unique ID for a row. UUIDs stay unique across devices, which future cloud sync needs. */
export function newId(): string {
  return randomUUID();
}

/** Current time as an ISO-8601 UTC string, e.g. "2026-11-20T09:15:00.000Z". */
export function nowIso(): string {
  return new Date().toISOString();
}
