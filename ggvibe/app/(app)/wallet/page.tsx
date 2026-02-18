import Link from 'next/link';
import { getServerViewer } from '@/lib/auth/server-viewer';
import { getWalletSummary } from '@/lib/app-data';

export default async function WalletPage() {
  const viewer = await getServerViewer();
  const summary = viewer ? await getWalletSummary(viewer.uid) : { available: 0, pending: 0, currency: 'USD' };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Wallet</h1>
      <p style={{ color: '#9fb4df' }}>Balance and payout overview.</p>
      <div style={{ border: '1px solid rgba(132,162,255,.28)', borderRadius: 12, padding: 14, maxWidth: 420 }}>
        <p>
          Account: <strong>{viewer?.email ?? viewer?.uid ?? 'unknown'}</strong>
        </p>
        <p>
          Available: <strong>{summary.currency} {summary.available.toFixed(2)}</strong>
        </p>
        <p>
          Pending: <strong>{summary.currency} {summary.pending.toFixed(2)}</strong>
        </p>
        <p style={{ color: '#8ca2cc' }}>No payouts yet? Configure payout destinations in <Link href="/payouts">Payouts</Link>.</p>
      </div>
    </div>
  );
}
