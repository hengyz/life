import { getBudgetItems, mapBudgetItem } from '../../../_shared/prep';
import { requireAdmin } from '../../../_shared/auth';
import { errorResponse, handleOptions, jsonResponse } from '../../../_shared/response';
import type { Env } from '../../../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return handleOptions();

  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  if (request.method === 'GET') {
    const items = await getBudgetItems(env.DB);
    return jsonResponse({ items });
  }

  if (request.method === 'POST') {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    if (!body.name) return errorResponse('name is required', 400);

    const status =
      body.status === 'paid' || body.status === 'cancelled' ? body.status : 'planned';

    const result = await env.DB
      .prepare(
        `INSERT INTO prep_budget_items
          (category, name, estimated_amount, actual_amount, status, notes, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        body.category ?? '',
        body.name,
        Number(body.estimated_amount) || 0,
        Number(body.actual_amount) || 0,
        status,
        body.notes ?? '',
        typeof body.sort_order === 'number' ? body.sort_order : 0,
      )
      .run();

    const row = await env.DB
      .prepare('SELECT * FROM prep_budget_items WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first<Record<string, unknown>>();

    return jsonResponse(mapBudgetItem(row!), 201);
  }

  return errorResponse('Method not allowed', 405);
};
