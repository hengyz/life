import { requireAdmin } from '../../../_shared/auth';
import {
  buildR2Key,
  extFromImageType,
  R2_ALLOWED_IMAGE_TYPES,
  R2_MAX_IMAGE_SIZE,
  r2PublicUrl,
} from '../../../_shared/r2';
import { errorResponse, handleOptions, jsonResponse } from '../../../_shared/response';
import type { Env } from '../../../_shared/types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return handleOptions();
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405);

  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  if (!env.MEDIA) {
    return errorResponse('R2 未绑定，请在 Pages Functions 中绑定 MEDIA', 503);
  }

  if (!env.R2_PUBLIC_URL) {
    return errorResponse(
      '请先在环境变量中配置 R2_PUBLIC_URL（如 https://photos.guangying.world）',
      503,
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse('无效的上传数据', 400);
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return errorResponse('请选择图片文件', 400);
  }

  if (!R2_ALLOWED_IMAGE_TYPES.has(file.type)) {
    return errorResponse('仅支持 JPG、PNG、WebP、GIF 格式', 400);
  }

  if (file.size > R2_MAX_IMAGE_SIZE) {
    return errorResponse('图片大小不能超过 10MB', 400);
  }

  const ext = extFromImageType(file.type);
  const key = buildR2Key(`${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`);

  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  const url = r2PublicUrl(env, key)!;

  return jsonResponse({ url, key }, 201);
};
