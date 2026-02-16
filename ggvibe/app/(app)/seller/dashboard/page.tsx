import { headers } from 'next/headers';
import { getBaseUrl } from '@/lib/url/base-url';

type SellerOverview = {
  seller: string;
  products: number;
  ordersToday: number;
  revenueToday: number;
};

async function fetchSellerOverview(): Promise<SellerOverview | null> {
  const headersList = await headers();
  const proto = headersList.get('x-forwarded-proto') || 'http';
  const host = headersList.get('host') || 'localhost:5000';
  const baseUrl = getBaseUrl(new Request(`${proto}://${host}`));
  const response = await fetch(`${baseUrl}/api/v1/seller/overview`, { cache: 'no-store' });
  if (!response.ok) return null;
  return (await response.json()) as SellerOverview;
}

export default async function SellerDashboardPage() {
  const overview = await fetchSellerOverview();

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Seller Dashboard</h1>
      <p style={{ color: '#9fb4df' }}>Overview for your seller activity.</p>
      <div style={{ border: '1px solid rgba(132,162,255,.28)', borderRadius: 12, padding: 14, maxWidth: 520 }}>
        <p>Seller account: <strong>{overview?.seller ?? 'unknown'}</strong></p>
        <p>Total products: <strong>{overview?.products ?? 0}</strong></p>
        <p>Orders today: <strong>{overview?.ordersToday ?? 0}</strong></p>
        <p>Revenue today: <strong>${overview?.revenueToday?.toFixed(2) ?? '0.00'}</strong></p>
        <p style={{ color: '#8ca2cc' }}>Connect your catalog to start selling.</p>
      </div>
    </div>
  );
}
