import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export async function signJwt(
  payload: Record<string, unknown>,
  secret: string,
  expiresIn: string = '15m',
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

export async function verifyJwt(
  token: string,
  secret: string,
): Promise<JWTPayload> {
  const secretKey = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, secretKey);
  return payload;
}

export function generateRefreshToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, '');
}
