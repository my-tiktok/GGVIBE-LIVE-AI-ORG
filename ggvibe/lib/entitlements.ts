import "server-only";
import { getOrCreateUserProfile } from "@/lib/user-store";
import type { UserEntitlements } from "@/features/billing/types";

export async function getUserEntitlements(uid: string, email?: string): Promise<UserEntitlements> {
  const user = await getOrCreateUserProfile(uid, email);
  const planActive = user.planStatus === "active" && (user.plan === "MONTHLY" || user.plan === "ANNUAL");

  return {
    hasMarketplaceAccess: planActive,
    plan: user.plan,
    planStatus: user.planStatus,
    expiresAt: user.planExpiresAt ?? null,
  };
}
