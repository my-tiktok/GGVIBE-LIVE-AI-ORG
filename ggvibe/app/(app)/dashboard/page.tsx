import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <p style={{ color: '#9fb4df' }}>Welcome back. Jump into your workspace.</p>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {[
          { href: '/chat', title: 'Chat', text: 'Send prompts and view responses.' },
          { href: '/marketplace', title: 'Marketplace', text: 'Browse and create listings.' },
          { href: '/wallet', title: 'Wallet', text: 'Check your balance and payouts.' },
          { href: '/seller/dashboard', title: 'Seller Dashboard', text: 'Track your seller metrics.' },
        ].map((item) => (
          <Link key={item.href} href={item.href} style={{ border: '1px solid rgba(132,162,255,.28)', borderRadius: 12, padding: 12, textDecoration: 'none', color: 'inherit', background: '#0c1430' }}>
            <strong>{item.title}</strong>
            <p style={{ marginBottom: 0, color: '#8ca2cc' }}>{item.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
