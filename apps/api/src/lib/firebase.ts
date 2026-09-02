// Firebase ID-token verification for the hybrid phone-OTP flow.
// We do NOT run the full firebase-admin SDK (it's Node-only and heavy).
// Instead we verify the JWT ourselves against Firebase's public JWKS
// endpoint. The cache is per-worker-isolate and short-lived — the keys
// rotate roughly daily.

import { jwtVerify, createRemoteJWKSet, type JWTPayload } from 'jose';

const JWKS_URL = new URL(
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
);
const ISSUER_PREFIX = 'https://securetoken.google.com/';

// Cache the JWKS across invocations within a worker isolate.
// jose handles its own internal caching of individual keys as well.
let cachedJwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJwks(): ReturnType<typeof createRemoteJWKSet> {
  if (cachedJwks) return cachedJwks;
  cachedJwks = createRemoteJWKSet(JWKS_URL);
  return cachedJwks;
}

export interface FirebasePhoneClaims extends JWTPayload {
  phone_number?: string;
  firebase?: {
    identities?: Record<string, string[]>;
    sign_in_provider?: string;
  };
  auth_time?: number;
}

/**
 * Verifies a Firebase ID token and returns its claims.
 * Rejects on: bad signature, wrong issuer, wrong audience, expired.
 * Callers should additionally check the sign_in_provider matches
 * the flow they expect (e.g. 'phone').
 */
export async function verifyFirebaseIdToken(
  idToken: string,
  projectId: string,
): Promise<FirebasePhoneClaims> {
  const jwks = getJwks();
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer:   `${ISSUER_PREFIX}${projectId}`,
    audience: projectId,
    algorithms: ['RS256'],
  });
  return payload as FirebasePhoneClaims;
}
