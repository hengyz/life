import type { PetProfile, TimelineMedia, TimelineNode } from './types';

export function parseTags(tags: string | null): string[] {
  if (!tags) return [];
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function serializeTags(tags: unknown): string {
  if (Array.isArray(tags)) {
    return JSON.stringify(tags.map(String));
  }
  if (typeof tags === 'string') {
    return tags.startsWith('[') ? tags : JSON.stringify([tags]);
  }
  return '[]';
}

export function mapNode(row: Record<string, unknown>, media: TimelineMedia[] = []): TimelineNode {
  return {
    id: row.id as number,
    pet_id: row.pet_id as number,
    title: (row.title as string) || '',
    content: (row.content as string) || '',
    event_date: (row.event_date as string) || '',
    location: (row.location as string) || '',
    tags: parseTags(row.tags as string),
    cover_url: (row.cover_url as string) || '',
    visibility: (row.visibility as 'public' | 'private') || 'public',
    sort_order: (row.sort_order as number) || 0,
    created_at: (row.created_at as string) || '',
    updated_at: (row.updated_at as string) || '',
    media,
  };
}

export async function getPetProfile(db: D1Database): Promise<PetProfile | null> {
  const result = await db
    .prepare('SELECT * FROM pet_profile ORDER BY id ASC LIMIT 1')
    .first<PetProfile>();
  return result;
}

export async function getMediaForNodes(
  db: D1Database,
  nodeIds: number[],
): Promise<Map<number, TimelineMedia[]>> {
  const map = new Map<number, TimelineMedia[]>();
  if (nodeIds.length === 0) return map;

  const placeholders = nodeIds.map(() => '?').join(',');
  const { results } = await db
    .prepare(
      `SELECT * FROM timeline_media WHERE node_id IN (${placeholders}) ORDER BY sort_order ASC, id ASC`,
    )
    .bind(...nodeIds)
    .all<TimelineMedia>();

  for (const item of results || []) {
    const list = map.get(item.node_id) || [];
    list.push(item);
    map.set(item.node_id, list);
  }
  return map;
}

export async function getNodeById(
  db: D1Database,
  id: number,
  publicOnly = true,
): Promise<TimelineNode | null> {
  let query = 'SELECT * FROM timeline_nodes WHERE id = ?';
  if (publicOnly) {
    query += " AND visibility = 'public'";
  }
  const row = await db.prepare(query).bind(id).first<Record<string, unknown>>();
  if (!row) return null;

  const mediaMap = await getMediaForNodes(db, [id]);
  return mapNode(row, mediaMap.get(id) || []);
}
