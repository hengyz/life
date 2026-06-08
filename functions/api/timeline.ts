import { getMediaForNodes, mapNode } from '../_shared/db';
import { errorResponse, handleOptions, jsonResponse } from '../_shared/response';
import type { Env, TimelineNode } from '../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return handleOptions();
  if (request.method !== 'GET') return errorResponse('Method not allowed', 405);

  const url = new URL(request.url);
  const order = url.searchParams.get('order') === 'asc' ? 'ASC' : 'DESC';
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10), 1), 100);
  const cursor = url.searchParams.get('cursor');

  let query = `
    SELECT * FROM timeline_nodes
    WHERE visibility = 'public'
  `;
  const params: (string | number)[] = [];

  if (cursor) {
    if (order === 'DESC') {
      query += ' AND event_date < ?';
    } else {
      query += ' AND event_date > ?';
    }
    params.push(cursor);
  }

  query += ` ORDER BY event_date ${order}, sort_order ${order}, id ${order} LIMIT ?`;
  params.push(limit + 1);

  const stmt = env.DB.prepare(query);
  const { results } = await stmt.bind(...params).all<Record<string, unknown>>();

  const rows = results || [];
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const nodeIds = pageRows.map((r) => r.id as number);
  const mediaMap = await getMediaForNodes(env.DB, nodeIds);

  const nodes: TimelineNode[] = pageRows.map((row) =>
    mapNode(row, mediaMap.get(row.id as number) || []),
  );

  const nextCursor = hasMore ? pageRows[pageRows.length - 1].event_date : null;

  return jsonResponse({
    nodes,
    nextCursor,
    hasMore,
  });
};
