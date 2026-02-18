import 'server-only';
import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export const FIREBASE_SESSION_COOKIE_NAME = '__session';

let initialized = false;

function decodeServiceAccountKey(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('{')) {
    return trimmed;
  }

  return Buffer.from(trimmed, 'base64').toString('utf8');
}

function parseServiceAccountFromEnv(): ServiceAccount {
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!envKey) {
    throw new Error('Firebase Admin credentials are not configured.');
  }

  const parsed = JSON.parse(decodeServiceAccountKey(envKey)) as Record<string, string | undefined>;
  const projectId = parsed.project_id;
  const clientEmail = parsed.client_email;
  const privateKey = (parsed.private_key || '').replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin credentials are incomplete.');
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  } satisfies ServiceAccount;
}

export function canInitializeFirebaseAdmin(): boolean {
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!envKey) return false;
  try {
    const decoded = decodeServiceAccountKey(envKey);
    const parsed = JSON.parse(decoded) as Record<string, string | undefined>;
    return Boolean(parsed.project_id && parsed.client_email && parsed.private_key);
  } catch {
    return false;
  }
}

function ensureFirebaseAdminInitialized(): void {
  if (initialized || getApps().length > 0) {
    initialized = true;
    return;
  }

  if (!canInitializeFirebaseAdmin()) {
    throw new Error('Firebase Admin SDK cannot be initialized: invalid or missing FIREBASE_SERVICE_ACCOUNT_KEY');
  }

  const serviceAccount = parseServiceAccountFromEnv();

  initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
  });
  initialized = true;
}

export function getFirebaseAdminAuth() {
  ensureFirebaseAdminInitialized();
  return getAuth();
}

export function getAdminFirestore() {
  ensureFirebaseAdminInitialized();
  return getFirestore();
}
