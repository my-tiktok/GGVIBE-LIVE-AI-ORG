import { headers } from 'next/headers';
import { getBaseUrl } from '@/lib/url/base-url';

type Transaction = { id: string; amount: number; type: 'credit' | 'debit'; createdAt: string };

async function fetchTransactions(): Promise<Transaction[]> {
  const headersList = await headers();
  const proto = headersList.get('x-forwarded-proto') || 'http';
  const host = headersList.get('host') || 'localhost:5000';
  const baseUrl = getBaseUrl(new Request(`${proto}://${host}`));
  const response = await fetch(`${baseUrl}/api/v1/transactions`, { cache: 'no-store' });
  if (!response.ok) return [];
  const payload = (await response.json()) as { transactions?: Transaction[] };
  return payload.transactions || [];
}

export default async function TransactionsPage() {
  const rows = await fetchTransactions();

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Transactions</h1>
      <p style={{ color: '#9fb4df' }}>Latest wallet activity.</p>
      {rows.length === 0 ? (
        <p style={{ color: '#8ca2cc' }}>No transactions yet.</p>
      ) : (
        <ul>
          {rows.map((row) => (
            <li key={row.id}>{row.createdAt} — {row.type} ${row.amount.toFixed(2)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
