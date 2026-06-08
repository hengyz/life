import { requireAdmin } from '../../_shared/auth';
import { getMediaForNodes, mapNode, serializeTags } from '../../_shared/db';
import { errorResponse, handleOptions, jsonResponse } from '../../_shared/response';
import type { Env, TimelineNode } from '../../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return handleOptions();

  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  if (request.method === 'GET') {
    const url = new URL(request.url);
    const order = url.searchParams.get('order') === 'asc' ? 'ASC' : 'DESC';

    const { results } = await env.DB
      .prepare(
        `SELECT * FROM timeline_nodes ORDER BY event_date ${order}, sort_order ${order}, id ${order}`,
      )
      .all<Record<string, unknown>>();

    const rows = results || [];
    const nodeIds = rows.map((r) => r.id as number);
    const mediaMap = await getMediaForNodes(env.DB, nodeIds);

    const nodes: TimelineNode[] = rows.map((row) =>
      mapNode(row, mediaMap.get(row.id as number) || []),
    );

    return jsonResponse({ nodes });
  }

  if (request.method === 'POST') {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    if (!body.event_date || !body.title) {
      return errorResponse('event_date and title are required', 400);
    }

    const visibility = body.visibility === 'private' ? 'private' : 'public';
    const sortOrder = typeof body.sort_order === 'number' ? body.sort_order : 0;

    const result = await env.DB
      .prepare(
        `INSERT INTO timeline_nodes
          (pet_id, title, content, event_date, location, tags, cover_url, visibility, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        body.pet_id ?? 1,
        body.title,
        body.content ?? '',
        body.event_date,
        body.location ?? '',
        serializeTags(body.tags),
        body.cover_url ?? '',
        visibility,
        sortOrder,
      )
      .run();

    const nodeId = result.meta.last_row_id;
    await syncMedia(env.DB, nodeId, body.media as MediaInput[] | undefined);

    const node = await getNodeWithMedia(env.DB, nodeId);
    return jsonResponse(node, 201);
  }

  return errorResponse('Method not allowed', 405);
};

interface MediaInput {
  type: 'image' | 'video';
  url: string;
  thumbnail_url?: string;
  caption?: string;
  sort_order?: number;
}

async function syncMedia(db: D1Database, nodeId: number, media?: MediaInput[]) {
  if (!media || !Array.isArray(media)) return;

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
