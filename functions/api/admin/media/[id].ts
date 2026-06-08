import { requireAdmin } from '../../../_shared/auth';
import { errorResponse, handleOptions, jsonResponse } from '../../../_shared/response';
import type { Env } from '../../../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

  if (request.method === 'OPTIONS') return handleOptions();
  if (request.method !== 'DELETE') return errorResponse('Method not allowed', 405);

  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  const id = parseInt(params.id as string, 10);
  if (isNaN(id)) return errorResponse('Invalid id', 400);

  await env.DB.prepare('DELETE FROM timeline_media WHERE id = ?').bind(id).run();
  return jsonResponse({ success: true });
};
