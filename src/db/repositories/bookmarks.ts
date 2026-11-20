/** Bookmarked topics, activities, assessments and scene lessons. */
import type { Database } from '../types';
import { newId, nowIso } from '../util';

export type BookmarkTarget = 'topic' | 'activity' | 'assessment' | 'scene_lesson';

export async function isBookmarked(db: Database, type: BookmarkTarget, targetId: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) AS n FROM bookmarks WHERE target_type = ? AND target_id = ? AND deleted_at IS NULL',
    [type, targetId],
  );
  return (row?.n ?? 0) > 0;
}

/** Adds the bookmark if absent, removes it if present. Returns the new state. */
export async function toggleBookmark(db: Database, type: BookmarkTarget, targetId: string): Promise<boolean> {
  const existing = await db.getFirstAsync<{ id: string; deleted_at: string | null }>(
    'SELECT id, deleted_at FROM bookmarks WHERE target_type = ? AND target_id = ?',
    [type, targetId],
  );
  if (!existing) {
    await db.runAsync('INSERT INTO bookmarks (id, target_type, target_id, created_at) VALUES (?, ?, ?, ?)', [
      newId(),
      type,
      targetId,
      nowIso(),
    ]);
    return true;
  }
  const nowActive = existing.deleted_at !== null;
  await db.runAsync('UPDATE bookmarks SET deleted_at = ? WHERE id = ?', [nowActive ? null : nowIso(), existing.id]);
  return nowActive;
}

export async function listBookmarks(db: Database, type: BookmarkTarget): Promise<string[]> {
  const rows = await db.getAllAsync<{ target_id: string }>(
    'SELECT target_id FROM bookmarks WHERE target_type = ? AND deleted_at IS NULL ORDER BY created_at DESC',
    [type],
  );
  return rows.map((r) => r.target_id);
}
