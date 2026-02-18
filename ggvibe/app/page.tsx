import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerViewer } from '@/lib/auth/server-viewer';

export default async function HomePage() {
  const viewer = await getServerViewer();
  if (viewer) {
    redirect('/dashboard');
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)', color: 'white', display: 'grid', placeItems: 'center', padding: 24 }}>
      <section style={{ maxWidth: 760, textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2.4rem, 8vw, 4rem)', marginBottom: 14 }}>GGVIBE LIVE AI</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 28 }}>
          Your AI-powered workspace for chat, wallet tracking, seller operations, and admin controls.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/login" style={{ background: '#00d4ff', color: '#0f0f23', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
          <Link href="/privacy" style={{ border: '1px solid rgba(255,255,255,.35)', color: 'white', padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ border: '1px solid rgba(255,255,255,.35)', color: 'white', padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}>Terms</Link>
        </div>
      </section>
    </main>
  );
}
