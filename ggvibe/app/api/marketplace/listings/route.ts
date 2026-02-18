import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { getUserEntitlements } from "@/lib/entitlements";
import { listListings, createListing } from "@/features/marketplace/server";
import { getSellerProfile } from "@/features/seller/server";

const querySchema = z.object({
  cursor: z.string().optional(),
  q: z.string().optional(),
  type: z.enum(["ALL", "PHYSICAL", "DIGITAL", "FOOD", "SERVICE"]).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).optional(),
  limit: z.coerce.number().min(1).max(50).default(12),
});

const createSchema = z.object({
  type: z.enum(["PHYSICAL", "DIGITAL", "FOOD", "SERVICE"]),
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().nonnegative(),
  currency: z.string().default("USD"),
  images: z.array(z.string().url()).default([]),
  location: z.string().optional(),
  status: z.enum(["active", "draft", "sold", "paused"]).default("draft"),
});

async function authz() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const entitlements = await getUserEntitlements(user.uid, user.email);
  if (!entitlements.hasMarketplaceAccess) {
    return {
      error: NextResponse.json({
        error: "subscription_required",
        message: "Subscribe to unlock Marketplace",
        entitlements,
      }, { status: 403 }),
    };
  }
  return { user, entitlements };
}

export async function GET(request: Request) {
  const guard = await authz();
  if (guard.error) return guard.error;

  const url = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = await listListings(parsed.data, guard.user!.uid);
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const guard = await authz();
  if (guard.error) return guard.error;

  const seller = await getSellerProfile(guard.user!.uid);
  if (!seller) {
    return NextResponse.json({
      error: "seller_profile_required",
      message: "Create your seller profile before publishing listings.",
    }, { status: 409 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.flatten() }, { status: 400 });
  }

  const listing = await createListing({
    ...parsed.data,
    ownerId: guard.user!.uid,
  });

  return NextResponse.json({ listing }, { status: 201 });
}
