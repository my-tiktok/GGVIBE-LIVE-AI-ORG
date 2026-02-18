import { NextResponse } from 'next/server';
import { getServerViewer } from '@/lib/auth/server-viewer';
import { getUserEntitlement } from '@/lib/auth/entitlements';
import { getMarketplaceListingById } from '@/lib/marketplace/listings';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const requestId = crypto.randomUUID();
  const viewer = await getServerViewer();

  if (!viewer) {
    return NextResponse.json({ error: 'unauthorized', requestId }, { status: 401, headers: { 'Cache-Control': 'no-store', 'X-Request-Id': requestId } });
  }

  const entitlement = await getUserEntitlement(viewer.uid);
  if (!entitlement.hasMarketplaceAccess) {
    return NextResponse.json(
      { error: 'subscription_required', message: 'Marketplace access requires active plan.', entitlement, requestId },
      { status: 403, headers: { 'Cache-Control': 'no-store', 'X-Request-Id': requestId } }
    );
  }

  const { id } = await params;
  const listing = await getMarketplaceListingById(id);
  if (!listing) {
    return NextResponse.json({ error: 'not_found', requestId }, { status: 404, headers: { 'Cache-Control': 'no-store', 'X-Request-Id': requestId } });
  }

  return NextResponse.json({ item: listing, requestId }, { headers: { 'Cache-Control': 'no-store', 'X-Request-Id': requestId } });
}
