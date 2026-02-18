import Link from 'next/link';
import { getServerViewer } from '@/lib/auth/server-viewer';
import { getSellerOverview } from '@/lib/app-data';

export default async function SellerDashboardPage() {
  const viewer = await getServerViewer();
  const overview = viewer ? await getSellerOverview(viewer.uid) : { listingCount: 0, ordersToday: 0, revenueToday: 0 };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Seller Dashboard</h1>
      <p style={{ color: '#9fb4df' }}>Overview for your seller activity.</p>
      <div style={{ border: '1px solid rgba(132,162,255,.28)', borderRadius: 12, padding: 14, maxWidth: 520 }}>
        <p>
          Seller account: <strong>{viewer?.email ?? viewer?.uid ?? 'unknown'}</strong>
        </p>
        <p>
          Total products: <strong>{overview.listingCount}</strong>
        </p>
        <p>
          Orders today: <strong>{overview.ordersToday}</strong>
        </p>
        <p>
          Revenue today: <strong>${overview.revenueToday.toFixed(2)}</strong>
        </p>
        <p style={{ color: '#8ca2cc' }}>
          Need profile updates? Head to <Link href="/seller">Seller Profile</Link>.
        </p>
      </div>
    </div>
  );
}
