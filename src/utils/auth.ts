import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

const TOKEN_HEADER = {
  alg: 'HS256',
  typ: 'JWT',
};

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) {
    return false;
  }

  const derived = scryptSync(password, salt, 64);
  const hashBuffer = Buffer.from(hash, 'hex');

  if (derived.length !== hashBuffer.length) {
    return false;
  }

  return timingSafeEqual(derived, hashBuffer);
}

export function createAuthToken(
  userId: string,
  email: string,
  secret: string,
  expiresInSeconds: number = 60 * 60 * 24 * 7,
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AuthTokenPayload = {
    sub: userId,
    email,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(TOKEN_HEADER));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signatureBase = `${headerB64}.${payloadB64}`;

  const signature = createHmac('sha256', secret)
    .update(signatureBase)
    .digest('base64url');

  return `${signatureBase}.${signature}`;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input).toString('base64url');
}
