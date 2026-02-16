import { headers } from 'next/headers';
import { getBaseUrl } from '@/lib/url/base-url';

type WalletSummary = {
  availableBalance: number;
  pendingBalance: number;
  currency: string;
  accountLabel: string;
};

async function fetchWalletSummary(): Promise<WalletSummary | null> {
  const headersList = await headers();
  const proto = headersList.get('x-forwarded-proto') || 'http';
  const host = headersList.get('host') || 'localhost:5000';
  const baseUrl = getBaseUrl(new Request(`${proto}://${host}`));
  const response = await fetch(`${baseUrl}/api/v1/wallet/summary`, { cache: 'no-store' });
  if (!response.ok) return null;
  return (await response.json()) as WalletSummary;
}

export default async function WalletPage() {
  const data = await fetchWalletSummary();

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Wallet</h1>
      <p style={{ color: '#9fb4df' }}>Balance and payout overview.</p>
      <div style={{ border: '1px solid rgba(132,162,255,.28)', borderRadius: 12, padding: 14, maxWidth: 420 }}>
        <p>Account: <strong>{data?.accountLabel ?? 'unknown'}</strong></p>
        <p>Available: <strong>${(data?.availableBalance ?? 0).toFixed(2)} {data?.currency ?? 'USD'}</strong></p>
        <p>Pending: <strong>${(data?.pendingBalance ?? 0).toFixed(2)} {data?.currency ?? 'USD'}</strong></p>
        <p style={{ color: '#8ca2cc' }}>No payouts yet. Earnings appear here after completed sales.</p>
      </div>
    </div>
  );
}
