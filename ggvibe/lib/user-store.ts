import "server-only";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { UserProfile } from "@/features/billing/types";

const inMemoryUsers = new Map<string, UserProfile>();

function nowIso() {
  return new Date().toISOString();
}

function docToProfile(uid: string, data: Record<string, unknown>): UserProfile {
  const now = nowIso();
  return {
    uid,
    email: typeof data.email === "string" ? data.email : undefined,
    plan: data.plan === "MONTHLY" || data.plan === "ANNUAL" ? data.plan : "FREE",
    planStatus: data.planStatus === "active" ? "active" : "inactive",
    planStartedAt: typeof data.planStartedAt === "string" ? data.planStartedAt : undefined,
    planExpiresAt: typeof data.planExpiresAt === "string" ? data.planExpiresAt : undefined,
    createdAt: typeof data.createdAt === "string" ? data.createdAt : now,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : now,
  };
}

export async function getOrCreateUserProfile(uid: string, email?: string): Promise<UserProfile> {
  const firestore = getAdminFirestore();

  if (firestore) {
    const ref = firestore.collection("users").doc(uid);
    const snap = await ref.get();
    if (snap.exists) {
      return docToProfile(uid, snap.data() || {});
    }

    const created: UserProfile = {
      uid,
      email,
      plan: "FREE",
      planStatus: "inactive",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    await ref.set(created, { merge: true });
    return created;
  }

  const existing = inMemoryUsers.get(uid);
  if (existing) return existing;

  const created: UserProfile = {
    uid,
    email,
    plan: "FREE",
    planStatus: "inactive",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  inMemoryUsers.set(uid, created);
  return created;
}

export async function updateUserPlan(
  uid: string,
  updates: Partial<Pick<UserProfile, "plan" | "planStatus" | "planStartedAt" | "planExpiresAt">>
): Promise<UserProfile> {
  const current = await getOrCreateUserProfile(uid);
  const next: UserProfile = {
    ...current,
    ...updates,
    updatedAt: nowIso(),
  };

  const firestore = getAdminFirestore();
  if (firestore) {
    await firestore.collection("users").doc(uid).set(next, { merge: true });
  } else {
    inMemoryUsers.set(uid, next);
  }

  return next;
}
