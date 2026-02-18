import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getUserEntitlements } from "@/lib/entitlements";
import { getListingById } from "@/features/marketplace/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const entitlements = await getUserEntitlements(user.uid, user.email);
  if (!entitlements.hasMarketplaceAccess) {
    return NextResponse.json({ error: "subscription_required", entitlements }, { status: 403 });
  }

  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({ listing });
}
