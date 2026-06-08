import { createToken } from '../../_shared/auth';
import { errorResponse, handleOptions, jsonResponse } from '../../_shared/response';
import type { Env } from '../../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return handleOptions();
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);

  if (!env.ADMIN_PASSWORD || !env.JWT_SECRET) {
    return errorResponse('Server auth not configured', 500);
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  if (!body.password || body.password !== env.ADMIN_PASSWORD) {
    return errorResponse('Invalid password', 401);
  }

  const token = await createToken(env);
  return jsonResponse({ token });
};
