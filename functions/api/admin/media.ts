import { requireAdmin } from '../../_shared/auth';
import { errorResponse, handleOptions, jsonResponse } from '../../_shared/response';
import type { Env } from '../../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return handleOptions();

  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  // POST /api/admin/media - save media record
  if (request.method === 'POST') {
    let body: {
      node_id?: number;
      type?: string;
      url?: string;
      thumbnail_url?: string;
      caption?: string;
      sort_order?: number;
    };
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    if (!body.node_id || !body.type || !body.url) {
      return errorResponse('node_id, type, and url are required', 400);
    }
    if (body.type !== 'image' && body.type !== 'video') {
      return errorResponse('type must be image or video', 400);
    }

    const result = await env.DB
      .prepare(
        `INSERT INTO timeline_media (node_id, type, url, thumbnail_url, caption, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        body.node_id,
        body.type,
        body.url,
        body.thumbnail_url ?? '',
        body.caption ?? '',
        body.sort_order ?? 0,
      )
      .run();

    const media = await env.DB
      .prepare('SELECT * FROM timeline_media WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first();

    return jsonResponse(media, 201);
  }

  return errorResponse('Method not allowed', 405);
};
