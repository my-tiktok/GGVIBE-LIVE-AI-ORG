import { getServerViewer } from '@/lib/auth/server-viewer';
import { getTransactions } from '@/lib/app-data';

export default async function TransactionsPage() {
  const viewer = await getServerViewer();
  const rows = viewer ? await getTransactions(viewer.uid) : [];

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Transactions</h1>
      <p style={{ color: '#9fb4df' }}>Latest wallet activity.</p>
      {rows.length === 0 ? (
        <p style={{ color: '#8ca2cc' }}>No transactions yet.</p>
      ) : (
        <ul>
          {rows.map((row) => (
            <li key={row.id}>
              {new Date(row.createdAt).toLocaleString()} — {row.type} {row.amount.toFixed(2)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
