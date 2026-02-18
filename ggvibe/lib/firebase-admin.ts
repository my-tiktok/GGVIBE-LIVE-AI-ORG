import "server-only";

import { cert, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function parseAsJson(raw: string): ServiceAccount | null {
  try {
    return JSON.parse(raw) as ServiceAccount;
  } catch {
    return null;
  }
}

function parseAsBase64(raw: string): ServiceAccount | null {
  try {
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(decoded) as ServiceAccount;
  } catch {
    return null;
  }
}

function parseServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;

  const parsedJson = parseAsJson(raw);
  if (parsedJson) return parsedJson;

  return parseAsBase64(raw);
}

function getFirebaseApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  const serviceAccount = parseServiceAccount();
  if (!serviceAccount) return null;

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export function getAdminFirestore() {
  const app = getFirebaseApp();
  if (!app) return null;
  return getFirestore(app);
}
