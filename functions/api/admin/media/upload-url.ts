import { requireAdmin } from '../../../_shared/auth';
import { buildR2Key, isR2Folder, r2PublicUrl } from '../../../_shared/r2';
import { errorResponse, handleOptions, jsonResponse } from '../../../_shared/response';
import type { Env } from '../../../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return handleOptions();
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);

  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  if (!env.MEDIA) {
    return errorResponse('R2 未绑定，请使用手动 URL 输入', 503);
  }

  let body: { filename?: string; contentType?: string; folder?: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  if (!body.filename) return errorResponse('filename is required', 400);

  const folder = body.folder?.trim() || '';
  if (!isR2Folder(folder)) {
    return errorResponse('folder 必须是 dog（狗狗）或 prep（备婚）', 400);
  }

  const safeName = body.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = buildR2Key(folder, `${Date.now()}-${safeName}`);

  return jsonResponse({
    key,
    publicUrl: r2PublicUrl(env, key),
    message: '请使用 POST /api/admin/media/upload 直接上传文件',
  });
};
