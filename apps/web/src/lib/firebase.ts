// Firebase — used ONLY for phone-OTP verification (hybrid auth).
// Everything else (email/password, Google OAuth, sessions, refresh tokens)
// stays on our own auth stack. When the user finishes an OTP verification
// with Firebase, we hand its ID token to /api/auth/firebase-phone/verify
// which trades it for OUR access/refresh tokens.

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
  type ConfirmationResult,
} from 'firebase/auth';

const config = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // messagingSenderId / storageBucket unused for auth-only setup
};

export function isFirebaseConfigured(): boolean {
  return !!(config.apiKey && config.authDomain && config.projectId);
}

let cachedApp:  FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

function getApp(): FirebaseApp {
  if (cachedApp) return cachedApp;
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured — set NEXT_PUBLIC_FIREBASE_API_KEY / AUTH_DOMAIN / PROJECT_ID / APP_ID.',
    );
  }
  cachedApp = getApps()[0] ?? initializeApp(config as Required<typeof config>);
  return cachedApp;
}

export function getFirebaseAuth(): Auth {
  if (cachedAuth) return cachedAuth;
  cachedAuth = getAuth(getApp());
  return cachedAuth;
}

// ─── Phone OTP helpers ─────────────────────────────────────────

let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Prepares an invisible reCAPTCHA verifier attached to the given element ID.
 * Call once before requesting an OTP. Safe to call multiple times — it caches.
 */
export function ensureRecaptcha(containerId: string): RecaptchaVerifier {
  if (recaptchaVerifier) return recaptchaVerifier;
  const auth = getFirebaseAuth();
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });
  return recaptchaVerifier;
}

/**
 * Sends a 6-digit OTP to the given E.164-formatted phone number
 * (e.g. "+919876543210"). Returns a ConfirmationResult the caller
 * uses to verify the code the user types in.
 */
export async function sendPhoneOtp(
  e164Phone: string,
  containerId: string,
): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();
  const verifier = ensureRecaptcha(containerId);
  return signInWithPhoneNumber(auth, e164Phone, verifier);
}

/**
 * Confirms the OTP the user typed. Returns the raw Firebase ID token
 * that our backend will verify to mint our own session.
 */
export async function verifyPhoneOtp(
  confirmation: ConfirmationResult,
  code: string,
): Promise<string> {
  const cred = await confirmation.confirm(code);
  const idToken = await cred.user.getIdToken();
  return idToken;
}

/**
 * Signs the user out of Firebase (does NOT touch our backend session — that
 * lives independently). Safe to call after we've traded the idToken.
 */
export async function signOutFirebase(): Promise<void> {
  if (!cachedAuth) return;
  try {
    await cachedAuth.signOut();
  } catch {
    /* best-effort */
  }
}
