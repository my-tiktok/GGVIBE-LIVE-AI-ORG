import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getServerViewer, isAdminEmail } from '@/lib/auth/server-viewer';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getServerViewer();
  if (!viewer) {
    redirect('/login');
  }

  const isAdmin = isAdminEmail(viewer.email);

  return (
    <main style={{ minHeight: '100vh', background: '#070b17', color: '#e7eeff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px', borderBottom: '1px solid rgba(141,167,255,.25)' }}>
        <strong>GGVIBE App</strong>
        <nav style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <Link href="/chat">Chat</Link>
          <Link href="/wallet">Wallet</Link>
          <Link href="/transactions">Transactions</Link>
          <Link href="/seller/dashboard">Seller</Link>
          {isAdmin && <Link href="/admin">Admin</Link>}
          <Link href="/api/auth/signout">Logout</Link>
        </nav>
      </header>
      <section style={{ padding: 20 }}>{children}</section>
    </main>
  );
}
