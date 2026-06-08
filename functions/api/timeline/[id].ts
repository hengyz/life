import { getNodeById } from '../../_shared/db';
import { errorResponse, handleOptions, jsonResponse } from '../../_shared/response';
import type { Env } from '../../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

  if (request.method === 'OPTIONS') return handleOptions();
  if (request.method !== 'GET') return errorResponse('Method not allowed', 405);

  const id = parseInt(params.id as string, 10);
  if (isNaN(id)) return errorResponse('Invalid id', 400);

  const node = await getNodeById(env.DB, id, true);
  if (!node) return errorResponse('Node not found', 404);

  return jsonResponse(node);
};
