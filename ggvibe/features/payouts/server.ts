import "server-only";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { PayoutPreference } from "@/features/payouts/types";

const memory = new Map<string, PayoutPreference>();

function nowIso() {
  return new Date().toISOString();
}

export function isValidBtcAddress(value: string): boolean {
  const candidate = value.trim();
  if (!candidate) return false;
  const legacy = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const bech32 = /^bc1[ac-hj-np-z02-9]{11,71}$/;
  return legacy.test(candidate) || bech32.test(candidate);
}

export async function upsertPayoutPreference(
  uid: string,
  payload: Omit<PayoutPreference, "uid" | "createdAt" | "updatedAt">
): Promise<PayoutPreference> {
  const existing = memory.get(uid);
  const next: PayoutPreference = {
    uid,
    method: payload.method,
    bank: payload.bank,
    crypto: payload.crypto,
    createdAt: existing?.createdAt ?? nowIso(),
    updatedAt: nowIso(),
  };

  const firestore = getAdminFirestore();
  if (firestore) {
    await firestore.collection("payoutPreferences").doc(uid).set(next, { merge: true });
  } else {
    memory.set(uid, next);
  }

  return next;
}

export async function getPayoutPreference(uid: string): Promise<PayoutPreference | null> {
  const firestore = getAdminFirestore();
  if (firestore) {
    const snap = await firestore.collection("payoutPreferences").doc(uid).get();
    if (!snap.exists) return null;
    return snap.data() as PayoutPreference;
  }

  return memory.get(uid) || null;
}
