import 'server-only';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase-admin';

export type PlanType = 'FREE' | 'MONTHLY' | 'ANNUAL';
export type PlanStatus = 'active' | 'inactive';

export type UserEntitlement = {
  plan: PlanType;
  planStatus: PlanStatus;
  planExpiresAt?: string | null;
  hasMarketplaceAccess: boolean;
};

const DEFAULT_ENTITLEMENT: UserEntitlement = {
  plan: 'FREE',
  planStatus: 'inactive',
  planExpiresAt: null,
  hasMarketplaceAccess: false,
};

function hasAccess(plan: PlanType, planStatus: PlanStatus, expiresAt?: string | null): boolean {
  if (planStatus !== 'active') return false;
  if (plan === 'FREE') return false;
  if (!expiresAt) return true;
  const expiry = Date.parse(expiresAt);
  if (Number.isNaN(expiry)) return false;
  return expiry > Date.now();
}

export async function getUserEntitlement(uid: string): Promise<UserEntitlement> {
  try {
    const db = getAdminFirestore();
    const snap = await db.collection('users').doc(uid).get();
    if (!snap.exists) return DEFAULT_ENTITLEMENT;

    const data = snap.data() as {
      plan?: PlanType;
      planStatus?: PlanStatus;
      planExpiresAt?: { toDate?: () => Date } | string | null;
    };

    const plan = data.plan === 'MONTHLY' || data.plan === 'ANNUAL' ? data.plan : 'FREE';
    const planStatus = data.planStatus === 'active' ? 'active' : 'inactive';

    const rawExpires = data.planExpiresAt;
    const planExpiresAt =
      typeof rawExpires === 'string'
        ? rawExpires
        : rawExpires && typeof rawExpires === 'object' && typeof rawExpires.toDate === 'function'
          ? rawExpires.toDate().toISOString()
          : null;

    return {
      plan,
      planStatus,
      planExpiresAt,
      hasMarketplaceAccess: hasAccess(plan, planStatus, planExpiresAt),
    };
  } catch {
    return DEFAULT_ENTITLEMENT;
  }
}

export async function activatePlan(uid: string, plan: Exclude<PlanType, 'FREE'>, planStatus: PlanStatus): Promise<void> {
  const db = getAdminFirestore();
  const expiresAt = new Date(Date.now() + (plan === 'MONTHLY' ? 30 : 365) * 24 * 60 * 60 * 1000);

  await db
    .collection('users')
    .doc(uid)
    .set(
      {
        plan,
        planStatus,
        planExpiresAt: expiresAt.toISOString(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}
