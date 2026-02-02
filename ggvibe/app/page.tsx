// app/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <div style={styles.brand}>GGVIBE LIVE AI</div>

        <nav style={styles.nav}>
          <Link href="/privacy" style={styles.navLink}>
            Privacy
          </Link>
          <Link href="/terms" style={styles.navLink}>
            Terms
          </Link>

          {isLoading ? (
            <span style={styles.muted}>Loading...</span>
          ) : isAuthenticated ? (
            <div style={styles.userRow}>
              {user?.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt="Profile"
                  width={32}
                  height={32}
                  style={styles.avatar}
                />
              ) : (
                <div style={styles.avatarFallback} aria-hidden="true" />
              )}

              <span style={styles.userName}>
                {user?.firstName || user?.email || "User"}
              </span>

              <button onClick={logout} style={styles.buttonGhost} type="button">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/api/login" style={styles.buttonPrimary}>
              Sign In
            </Link>
          )}
        </nav>
      </header>

      <section style={styles.hero}>
        {isAuthenticated ? (
          <>
            <h1 style={styles.h1}>
              Welcome back, {user?.firstName || "User"}!
            </h1>
            <p style={styles.lead}>
              You&apos;re signed in and ready to use GGVIBE LIVE AI.
            </p>
          </>
        ) : (
          <>
            <h1 style={styles.h1}>GGVIBE LIVE AI</h1>
            <p style={styles.lead}>
              Your AI-powered chat assistant. Experience natural conversations, get
              instant answers, and unlock creativity with advanced AI technology.
            </p>

            <div style={styles.ctaRow}>
              <Link href="/api/login" style={styles.buttonCta}>
                Get Started Free
              </Link>
            </div>
          </>
        )}

        <div style={styles.featureGrid}>
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

      <footer style={styles.footer}>
        <div style={styles.footerLinks}>
          <Link href="/privacy" style={styles.footerLink}>
            Privacy Policy
          </Link>
          <Link href="/terms" style={styles.footerLink}>
            Terms of Service
          </Link>
        </div>

        <p style={styles.footerText}>
          &copy; {new Date().getFullYear()} GGVIBE LIVE AI. All rights reserved.
        </p>
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardText}>{description}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
    color: "white",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    gap: 16,
    flexWrap: "wrap",
  },
  brand: { fontSize: 24, fontWeight: 800, color: "#00d4ff", letterSpacing: 0.5 },
  nav: { display: "flex", gap: 20, alignItems: "center" },
  navLink: { color: "rgba(255,255,255,0.8)", textDecoration: "none" },
  muted: { color: "rgba(255,255,255,0.6)" },
  userRow: { display: "flex", alignItems: "center", gap: 12 },
  userName: { color: "rgba(255,255,255,0.85)" },
  avatar: { borderRadius: "50%", border: "2px solid #00d4ff" },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.08)",
  },
  buttonPrimary: {
    background: "#00d4ff",
    color: "#0f0f23",
    padding: "8px 18px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 700,
  },
  buttonGhost: {
    background: "rgba(255,255,255,0.1)",
    color: "white",
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)",
    cursor: "pointer",
    fontWeight: 600,
  },
  hero: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "44px 20px",
    textAlign: "center",
  },
  h1: {
    fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
    margin: "0 0 16px 0",
    background: "linear-gradient(90deg, #00d4ff, #7c3aed, #f472b6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontWeight: 900,
    letterSpacing: -0.6,
  },
  lead: {
    fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
    maxWidth: 720,
    margin: "0 0 28px 0",
    color: "rgba(255,255,255,0.82)",
    lineHeight: 1.6,
  },
  ctaRow: { display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" },
  buttonCta: {
    background: "linear-gradient(90deg, #00d4ff, #7c3aed)",
    color: "white",
    padding: "14px 34px",
    borderRadius: 14,
    textDecoration: "none",
    fontWeight: 800,
    fontSize: "1.05rem",
  },
  featureGrid: {
    marginTop: 54,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 18,
    maxWidth: 920,
    width: "100%",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 22,
    border: "1px solid rgba(255,255,255,0.1)",
    textAlign: "left",
  },
  cardTitle: { margin: "0 0 10px 0", color: "#00d4ff", fontSize: "1.1rem" },
  cardText: { margin: 0, color: "rgba(255,255,255,0.72)", lineHeight: 1.55 },
  footer: {
    padding: "26px 40px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    textAlign: "center",
    color: "rgba(255,255,255,0.6)",
  },
  footerLinks: { marginBottom: 12, display: "flex", gap: 22, justifyContent: "center" },
  footerLink: { color: "rgba(255,255,255,0.65)", textDecoration: "none" },
  footerText: { margin: 0, fontSize: 14 },
};