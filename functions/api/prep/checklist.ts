import { getChecklistItems } from '../../_shared/prep';
import { errorResponse, handleOptions, jsonResponse } from '../../_shared/response';
import type { Env } from '../../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return handleOptions();
  if (request.method !== 'GET') return errorResponse('Method not allowed', 405);

  const items = await getChecklistItems(env.DB);
  return jsonResponse({ items });
};
