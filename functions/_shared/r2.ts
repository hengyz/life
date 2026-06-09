/** Object key prefix in shared R2 bucket `photos`. */
export const R2_PREFIX = 'life';

export function buildR2Key(relativePath: string): string {
  return `${R2_PREFIX}/${relativePath}`;
}
