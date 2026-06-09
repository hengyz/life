import { requireAdmin } from '../../../_shared/auth';
import { buildR2Key } from '../../../_shared/r2';
import { errorResponse, handleOptions, jsonResponse } from '../../../_shared/response';
import type { Env } from '../../../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return handleOptions();
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);

  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  if (!env.MEDIA) {
    return errorResponse(
      'R2 storage not configured. Use manual URL input for now.',
      501,
    );
  }

  let body: { filename?: string; contentType?: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  if (!body.filename) return errorResponse('filename is required', 400);

  const key = buildR2Key(`${Date.now()}-${body.filename}`);

  return jsonResponse({
    uploadUrl: null,
    key,
    message: 'R2 presigned upload not yet implemented. Please use manual URL input.',
  });
};
