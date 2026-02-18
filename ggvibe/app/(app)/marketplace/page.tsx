import Link from 'next/link';
import { MarketplaceGrid } from '@/components/marketplace/marketplace-grid';
import { getServerViewer } from '@/lib/auth/server-viewer';
import { getUserEntitlement } from '@/lib/auth/entitlements';
import { listMarketplaceListings } from '@/lib/marketplace/listings';

export default async function MarketplacePage() {
  const viewer = await getServerViewer();
  const entitlement = viewer ? await getUserEntitlement(viewer.uid) : null;
  const listings = await listMarketplaceListings(12);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Marketplace</h1>
      <p style={{ color: '#9fb4df' }}>Find PHYSICAL, DIGITAL, and FOOD listings from creators.</p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <Link href="/plans">View plans</Link>
        <Link href="/seller">Create seller profile</Link>
      </div>
      {!entitlement?.hasMarketplaceAccess && (
        <div style={{ marginBottom: 12, border: '1px solid rgba(237,186,49,.35)', borderRadius: 10, padding: 10, background: 'rgba(237,186,49,.08)' }}>
          Your plan is {entitlement?.plan ?? 'FREE'} ({entitlement?.planStatus ?? 'inactive'}). Upgrade to unlock listings.
        </div>
      )}
      <MarketplaceGrid initialItems={listings.listings} locked={!entitlement?.hasMarketplaceAccess} />
    </div>
  );
}
