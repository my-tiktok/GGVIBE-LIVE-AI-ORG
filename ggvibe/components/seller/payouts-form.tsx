'use client';

import { FormEvent, useState } from 'react';

type Payouts = {
  btcAddress: string;
  ngnBankName: string;
  ngnAccountNumber: string;
  ngnAccountName: string;
};

export function PayoutsForm({ initial }: { initial: Partial<Payouts> | null }) {
  const [state, setState] = useState<Payouts>({
    btcAddress: initial?.btcAddress || '',
    ngnBankName: initial?.ngnBankName || '',
    ngnAccountNumber: initial?.ngnAccountNumber || '',
    ngnAccountName: initial?.ngnAccountName || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch('/api/seller/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });

    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      if (payload?.fieldErrors) {
        const firstField = Object.values(payload.fieldErrors).find(
          (value) => Array.isArray(value) && value.length > 0
        ) as string[] | undefined;
        setError(firstField?.[0] || payload?.message || 'Unable to save payout settings.');
      } else {
        setError(payload?.message || 'Unable to save payout settings.');
      }
      return;
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10, maxWidth: 520 }}>
      <label>
        BTC wallet
        <input value={state.btcAddress} onChange={(event) => setState((prev) => ({ ...prev, btcAddress: event.target.value }))} placeholder="bc1..." />
      </label>
      <label>
        NGN bank name
        <input value={state.ngnBankName} onChange={(event) => setState((prev) => ({ ...prev, ngnBankName: event.target.value }))} placeholder="Bank name" />
      </label>
      <label>
        NGN account number
        <input value={state.ngnAccountNumber} onChange={(event) => setState((prev) => ({ ...prev, ngnAccountNumber: event.target.value }))} placeholder="10-digit account" />
      </label>
      <label>
        NGN account name
        <input value={state.ngnAccountName} onChange={(event) => setState((prev) => ({ ...prev, ngnAccountName: event.target.value }))} placeholder="Account holder" />
      </label>
      {error && <p style={{ color: '#ffb7b7' }}>{error}</p>}
      <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save payout settings'}</button>
    </form>
  );
}
