import "server-only";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { SellerProfile } from "@/features/seller/types";

const memory = new Map<string, SellerProfile>();

function nowIso() {
  return new Date().toISOString();
}

export async function getSellerProfile(uid: string): Promise<SellerProfile | null> {
  const firestore = getAdminFirestore();

  if (firestore) {
    const snap = await firestore.collection("sellerProfiles").doc(uid).get();
    if (!snap.exists) return null;
    const data = snap.data() || {};
    return {
      uid,
      displayName: String(data.displayName || ""),
      storeName: String(data.storeName || ""),
      bio: String(data.bio || ""),
      country: String(data.country || ""),
      isVerified: Boolean(data.isVerified),
      createdAt: String(data.createdAt || nowIso()),
      updatedAt: String(data.updatedAt || nowIso()),
    };
  }

  return memory.get(uid) || null;
}

export async function upsertSellerProfile(
  uid: string,
  payload: Pick<SellerProfile, "displayName" | "storeName" | "bio" | "country">
): Promise<SellerProfile> {
  const existing = await getSellerProfile(uid);
  const next: SellerProfile = {
    uid,
    displayName: payload.displayName,
    storeName: payload.storeName,
    bio: payload.bio,
    country: payload.country,
    isVerified: existing?.isVerified ?? false,
    createdAt: existing?.createdAt ?? nowIso(),
    updatedAt: nowIso(),
  };

  const firestore = getAdminFirestore();
  if (firestore) {
    await firestore.collection("sellerProfiles").doc(uid).set(next, { merge: true });
  } else {
    memory.set(uid, next);
  }

  return next;
}
