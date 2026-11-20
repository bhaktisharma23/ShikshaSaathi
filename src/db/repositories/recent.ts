/** "Continue where you left off": remembers the last topics a teacher opened. */
import type { Database } from '../types';
import { nowIso } from '../util';

export type RecentTargetType = 'topic';

export type RecentItem = { targetType: RecentTargetType; targetId: string; openedAt: string };

const KEEP = 20;

export async function recordOpened(db: Database, targetType: RecentTargetType, targetId: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO recent_items (target_type, target_id, opened_at) VALUES (?, ?, ?)
       ON CONFLICT (target_type, target_id) DO UPDATE SET opened_at = excluded.opened_at`,
      [targetType, targetId, nowIso()],
    );
    // Keep the table small: drop everything older than the newest KEEP entries.
    await db.runAsync(
      `DELETE FROM recent_items WHERE rowid NOT IN
         (SELECT rowid FROM recent_items ORDER BY opened_at DESC LIMIT ?)`,
      [KEEP],
    );
  });
}

export async function listRecent(db: Database, targetType: RecentTargetType, limit = 3): Promise<RecentItem[]> {
  const rows = await db.getAllAsync<{ target_type: RecentTargetType; target_id: string; opened_at: string }>(
    `SELECT target_type, target_id, opened_at FROM recent_items
     WHERE target_type = ? ORDER BY opened_at DESC LIMIT ?`,
    [targetType, limit],
  );
  return rows.map((r) => ({ targetType: r.target_type, targetId: r.target_id, openedAt: r.opened_at }));
}
