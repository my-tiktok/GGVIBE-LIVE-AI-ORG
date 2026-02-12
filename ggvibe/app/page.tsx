"use client";

import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00d4ff' }}>
          GGVIBE LIVE AI
        </div>
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Terms</a>
          <a href="/market" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Market</a>
          <a href="/payouts" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Payouts</a>
          {isLoading ? (
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Loading...</span>
          ) : isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {user?.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%',
                    border: '2px solid #00d4ff'
                  }} 
                />
              )}
              <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                {user?.firstName || user?.email || 'User'}
              </span>
              <button 
                onClick={logout}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}>
                Logout
              </button>
            </div>
          ) : (
            <a href="/login" style={{
              background: '#00d4ff',
              color: '#0f0f23',
              padding: '8px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
            }}>Sign In</a>
          )}
        </nav>
      </header>

      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        {isAuthenticated ? (
          <>
            <h1 style={{
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              margin: '0 0 24px 0',
              background: 'linear-gradient(90deg, #00d4ff, #7c3aed, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p style={{
              fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
              maxWidth: '700px',
              margin: '0 0 40px 0',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.6,
            }}>
              You&apos;re signed in and ready to use GGVIBE LIVE AI.
            </p>
          </>
        ) : (
          <>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
              margin: '0 0 24px 0',
              background: 'linear-gradient(90deg, #00d4ff, #7c3aed, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              GGVIBE LIVE AI
            </h1>
            <p style={{
              fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
              maxWidth: '700px',
              margin: '0 0 40px 0',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.6,
            }}>
              Your intelligent AI-powered chat assistant. Experience natural conversations,
              get instant answers, and unlock creativity with advanced AI technology.
            </p>

            <div style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <a href="/login" style={{
                background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
                color: 'white',
                padding: '16px 40px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '1.1rem',
                transition: 'transform 0.2s',
              }}>
                Get Started Free
              </a>
            </div>
          </>
        )}

        <div style={{
          marginTop: '80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          maxWidth: '900px',
          width: '100%',
        }}>
          <FeatureCard
            title="Natural Conversations"
            description="Chat naturally with AI that understands context and nuance."
          />
          <FeatureCard
            title="Instant Answers"
            description="Get helpful responses to your questions in real-time."
          />
          <FeatureCard
            title="Creative Assistance"
            description="Generate ideas, content, and solutions with AI creativity."
          />
        </div>
      </section>

      <footer style={{
        padding: '30px 40px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)',
      }}>
        <div style={{ marginBottom: '16px' }}>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginRight: '24px' }}>Privacy Policy</a>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Terms of Service</a>
        </div>
        <p style={{ margin: 0, fontSize: '14px' }}>
          &copy; {new Date().getFullYear()} GGVIBE LIVE AI. All rights reserved.
        </p>
      </footer>
    </main>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#00d4ff', fontSize: '1.2rem' }}>{title}</h3>
      <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{description}</p>
    </div>
  )
}
