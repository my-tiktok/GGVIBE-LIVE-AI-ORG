import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getServerViewer } from '@/lib/auth/server-viewer';
import { getUserEntitlement } from '@/lib/auth/entitlements';
import { createMarketplaceListing, listingInputSchema, listMarketplaceListings } from '@/lib/marketplace/listings';
import { getSellerProfile } from '@/lib/seller/profile';

export const runtime = 'nodejs';

function noStore(requestId: string) {
  return {
    'Cache-Control': 'no-store',
    'X-Request-Id': requestId,
  };
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  const viewer = await getServerViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'unauthorized', requestId }, { status: 401, headers: noStore(requestId) });
  }

  const entitlement = await getUserEntitlement(viewer.uid);
  if (!entitlement.hasMarketplaceAccess) {
    return NextResponse.json(
      {
        error: 'subscription_required',
        message: 'Marketplace requires an active MONTHLY or ANNUAL plan.',
        entitlement,
        requestId,
      },
      { status: 403, headers: noStore(requestId) }
    );
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor') ?? undefined;
  const limit = Number(searchParams.get('limit') || '12');
  const data = await listMarketplaceListings(limit, cursor);

  return NextResponse.json(
    {
      items: data.listings,
      nextCursor: data.nextCursor,
      source: data.source,
      requestId,
    },
    { headers: noStore(requestId) }
  );
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const viewer = await getServerViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'unauthorized', requestId }, { status: 401, headers: noStore(requestId) });
  }

  const entitlement = await getUserEntitlement(viewer.uid);
  if (!entitlement.hasMarketplaceAccess) {
    return NextResponse.json(
      {
        error: 'subscription_required',
        message: 'Activate MONTHLY or ANNUAL to publish listings.',
        entitlement,
        requestId,
      },
      { status: 403, headers: noStore(requestId) }
    );
  }

  const seller = await getSellerProfile(viewer.uid);
  if (!seller.profile) {
    return NextResponse.json(
      { error: 'seller_profile_required', message: 'Create a seller profile before posting listings.', requestId },
      { status: 400, headers: noStore(requestId) }
    );
  }

  try {
    const json = await request.json();
    const payload = listingInputSchema.parse(json);
    const id = await createMarketplaceListing({ ...payload, sellerId: viewer.uid });
    return NextResponse.json({ id, requestId }, { status: 201, headers: noStore(requestId) });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'validation_error', issues: error.flatten(), requestId },
        { status: 400, headers: noStore(requestId) }
      );
    }

    return NextResponse.json(
      { error: 'internal_error', message: 'Unable to create listing.', requestId },
      { status: 500, headers: noStore(requestId) }
    );
  }
}
