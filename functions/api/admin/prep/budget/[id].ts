import { mapBudgetItem } from '../../../../_shared/prep';
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
      .prepare('SELECT * FROM prep_budget_items WHERE id = ?')
      .bind(id)
      .first<Record<string, unknown>>();
    if (!existing) return errorResponse('Budget item not found', 404);

    const status =
      body.status === 'paid' || body.status === 'cancelled' || body.status === 'planned'
        ? body.status
        : (existing.status as string);

    await env.DB
      .prepare(
        `UPDATE prep_budget_items
         SET category = ?, name = ?, estimated_amount = ?, actual_amount = ?,
             status = ?, notes = ?, sort_order = ?, updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(
        body.category ?? existing.category,
        body.name ?? existing.name,
        body.estimated_amount !== undefined
          ? Number(body.estimated_amount)
          : existing.estimated_amount,
        body.actual_amount !== undefined ? Number(body.actual_amount) : existing.actual_amount,
        status,
        body.notes ?? existing.notes,
        body.sort_order !== undefined ? body.sort_order : existing.sort_order,
        id,
      )
      .run();

    const row = await env.DB
      .prepare('SELECT * FROM prep_budget_items WHERE id = ?')
      .bind(id)
      .first<Record<string, unknown>>();

    return jsonResponse(mapBudgetItem(row!));
  }

  if (request.method === 'DELETE') {
    const result = await env.DB.prepare('DELETE FROM prep_budget_items WHERE id = ?').bind(id).run();
    if (!result.meta.changes) return errorResponse('Budget item not found', 404);
    return jsonResponse({ success: true });
  }

  return errorResponse('Method not allowed', 405);
};
