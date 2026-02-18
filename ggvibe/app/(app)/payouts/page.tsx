import { PayoutsForm } from '@/components/seller/payouts-form';
import { getServerViewer } from '@/lib/auth/server-viewer';
import { getSellerProfile } from '@/lib/seller/profile';

export default async function PayoutsPage() {
  const viewer = await getServerViewer();
  const data = viewer ? await getSellerProfile(viewer.uid) : { payouts: null };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Payouts</h1>
      <p style={{ color: '#9fb4df' }}>Configure BTC and NGN payout destinations.</p>
      <PayoutsForm initial={data.payouts as { btcAddress?: string; ngnBankName?: string; ngnAccountNumber?: string; ngnAccountName?: string } | null} />
    </div>
  );
}
