import { getPrepProfile } from '../../_shared/prep';
import { requireAdmin } from '../../_shared/auth';
import { errorResponse, handleOptions, jsonResponse } from '../../_shared/response';
import type { Env } from '../../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return handleOptions();

  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  if (request.method === 'GET') {
    const profile = await getPrepProfile(env.DB);
    if (!profile) return errorResponse('Prep profile not found', 404);
    return jsonResponse(profile);
  }

  if (request.method === 'PUT') {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const existing = await getPrepProfile(env.DB);
    if (!existing) return errorResponse('Prep profile not found', 404);

    await env.DB
      .prepare(
        `UPDATE prep_profile
         SET title = ?, wedding_date = ?, total_budget = ?, description = ?, updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(
        body.title ?? existing.title,
        body.wedding_date ?? existing.wedding_date,
        typeof body.total_budget === 'number' ? body.total_budget : existing.total_budget,
        body.description ?? existing.description,
        existing.id,
      )
      .run();

    const profile = await getPrepProfile(env.DB);
    return jsonResponse(profile);
  }

  return errorResponse('Method not allowed', 405);
};
