import type { Env } from './types';

const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days

function base64UrlEncode(data: ArrayBuffer | string): string {
  const bytes =
    typeof data === 'string'
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createToken(env: Env): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS,
    }),
  );
  const key = await getHmacKey(env.JWT_SECRET);
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${header}.${payload}`),
  );
  return `${header}.${payload}.${base64UrlEncode(signature)}`;
}

export async function verifyToken(env: Env, token: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [header, payload, signature] = parts;
    const key = await getHmacKey(env.JWT_SECRET);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlDecode(signature),
      new TextEncoder().encode(`${header}.${payload}`),
    );
    if (!valid) return false;

    const decoded = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

export async function requireAdmin(request: Request, env: Env): Promise<Response | null> {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const token = auth.slice(7);
  const valid = await verifyToken(env, token);
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}
