import { requireAdmin } from '../../../_shared/auth';
import { getMediaForNodes, mapNode, serializeTags } from '../../../_shared/db';
import { errorResponse, handleOptions, jsonResponse } from '../../../_shared/response';
import type { Env, TimelineNode } from '../../../_shared/types';

interface MediaInput {
  type: 'image' | 'video';
  url: string;
  thumbnail_url?: string;
  caption?: string;
  sort_order?: number;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

  if (request.method === 'OPTIONS') return handleOptions();

  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  const id = parseInt(params.id as string, 10);
  if (isNaN(id)) return errorResponse('Invalid id', 400);

  const existing = await env.DB
    .prepare('SELECT * FROM timeline_nodes WHERE id = ?')
    .bind(id)
    .first<Record<string, unknown>>();
  if (!existing) return errorResponse('Node not found', 404);

  if (request.method === 'PUT') {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const visibility =
      body.visibility === 'private' ? 'private' : body.visibility === 'public' ? 'public' : existing.visibility;

    await env.DB
      .prepare(
        `UPDATE timeline_nodes SET
          title = ?, content = ?, event_date = ?, location = ?,
          tags = ?, cover_url = ?, visibility = ?, sort_order = ?,
          updated_at = datetime('now')
        WHERE id = ?`,
      )
      .bind(
        body.title ?? existing.title,
        body.content ?? existing.content,
        body.event_date ?? existing.event_date,
        body.location ?? existing.location,
        body.tags !== undefined ? serializeTags(body.tags) : existing.tags,
        body.cover_url ?? existing.cover_url,
        visibility,
        typeof body.sort_order === 'number' ? body.sort_order : existing.sort_order,
        id,
      )
      .run();

    if (body.media !== undefined) {
      await syncMedia(env.DB, id, body.media as MediaInput[]);
    }

    const node = await getNodeWithMedia(env.DB, id);
    return jsonResponse(node);
  }

  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM timeline_media WHERE node_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM timeline_nodes WHERE id = ?').bind(id).run();
    return jsonResponse({ success: true });
  }

  return errorResponse('Method not allowed', 405);
};

async function syncMedia(db: D1Database, nodeId: number, media: MediaInput[]) {
  await db.prepare('DELETE FROM timeline_media WHERE node_id = ?').bind(nodeId).run();

  for (let i = 0; i < media.length; i++) {
    const item = media[i];
    if (!item.url || !item.type) continue;
    await db
      .prepare(
        `INSERT INTO timeline_media (node_id, type, url, thumbnail_url, caption, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        nodeId,
        item.type,
        item.url,
        item.thumbnail_url ?? '',
        item.caption ?? '',
        item.sort_order ?? i,
      )
      .run();
  }
}

async function getNodeWithMedia(db: D1Database, id: number): Promise<TimelineNode | null> {
  const row = await db
    .prepare('SELECT * FROM timeline_nodes WHERE id = ?')
    .bind(id)
    .first<Record<string, unknown>>();
  if (!row) return null;
  const mediaMap = await getMediaForNodes(db, [id]);
  return mapNode(row, mediaMap.get(id) || []);
}
