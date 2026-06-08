import { mapChecklistItem } from '../../../../_shared/prep';
import { requireAdmin } from '../../../../_shared/auth';
import { errorResponse, handleOptions, jsonResponse } from '../../../../_shared/response';
import type { Env } from '../../../../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const id = parseInt(params.id as string, 10);

  if (request.method === 'OPTIONS') return handleOptions();
  if (Number.isNaN(id)) return errorResponse('Invalid id', 400);

  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  if (request.method === 'PUT') {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const existing = await env.DB
      .prepare('SELECT * FROM prep_checklist_items WHERE id = ?')
      .bind(id)
      .first<Record<string, unknown>>();
    if (!existing) return errorResponse('Checklist item not found', 404);

    await env.DB
      .prepare(
        `UPDATE prep_checklist_items
         SET category = ?, title = ?, due_date = ?, completed = ?, notes = ?,
             sort_order = ?, updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(
        body.category ?? existing.category,
        body.title ?? existing.title,
        body.due_date ?? existing.due_date,
        body.completed !== undefined ? (body.completed ? 1 : 0) : existing.completed,
        body.notes ?? existing.notes,
        body.sort_order !== undefined ? body.sort_order : existing.sort_order,
        id,
      )
      .run();

    const row = await env.DB
      .prepare('SELECT * FROM prep_checklist_items WHERE id = ?')
      .bind(id)
      .first<Record<string, unknown>>();

    return jsonResponse(mapChecklistItem(row!));
  }

  if (request.method === 'DELETE') {
    const result = await env.DB
      .prepare('DELETE FROM prep_checklist_items WHERE id = ?')
      .bind(id)
      .run();
    if (!result.meta.changes) return errorResponse('Checklist item not found', 404);
    return jsonResponse({ success: true });
  }

  return errorResponse('Method not allowed', 405);
};
