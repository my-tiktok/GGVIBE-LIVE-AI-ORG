export type UserPlan = "FREE" | "MONTHLY" | "ANNUAL";
export type PlanStatus = "active" | "inactive";

export interface UserProfile {
  uid: string;
  email?: string;
  plan: UserPlan;
  planStatus: PlanStatus;
  planStartedAt?: string;
  planExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserEntitlements {
  hasMarketplaceAccess: boolean;
  plan: UserPlan;
  planStatus: PlanStatus;
  expiresAt: string | null;
}
