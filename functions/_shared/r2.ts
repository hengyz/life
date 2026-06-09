/** Object key prefix in shared R2 bucket `photos`. */
export const R2_PREFIX = 'life';

export const R2_MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export const R2_ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export function buildR2Key(relativePath: string): string {
  return `${R2_PREFIX}/${relativePath}`;
}

export function r2PublicUrl(env: { R2_PUBLIC_URL?: string }, key: string): string | null {
  if (!env.R2_PUBLIC_URL) return null;
  return `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
}

export function extFromImageType(type: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return map[type] || 'jpg';
}

export function r2KeyFromUrl(url: string, publicBase?: string): string | null {
  if (!publicBase) return null;
  try {
    const base = publicBase.replace(/\/$/, '');
    if (!url.startsWith(base + '/')) return null;
    return url.slice(base.length + 1);
  } catch {
    return null;
  }
}
