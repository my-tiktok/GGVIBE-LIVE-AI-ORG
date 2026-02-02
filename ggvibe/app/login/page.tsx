"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_callback: "Login session expired or was invalid. Please try again.",
  provider_error: "Authentication provider returned an error. Please try again.",
  invalid_claims: "Could not retrieve your profile information. Please try again.",
  auth_failed: "Authentication failed. Please try again.",
  login_failed: "Could not initiate login. Please try again.",
  unauthorized: "You must be logged in to access that page.",
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "1rem",
  } as React.CSSProperties,
  card: {
    textAlign: "center" as const,
    padding: "2rem",
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: "1rem",
    border: "1px solid #334155",
    maxWidth: "24rem",
    width: "100%",
  } as React.CSSProperties,
  errorBox: {
    marginBottom: "1.5rem",
    padding: "1rem",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "0.5rem",
  } as React.CSSProperties,
  errorIcon: {
    width: "3rem",
    height: "3rem",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 0.75rem",
  } as React.CSSProperties,
  errorText: {
    color: "#fca5a5",
    fontSize: "0.875rem",
    margin: 0,
  } as React.CSSProperties,
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: "0.5rem",
  } as React.CSSProperties,
  subtitle: {
    color: "#94a3b8",
    marginBottom: "1.5rem",
  } as React.CSSProperties,
  button: {
    width: "100%",
    padding: "0.75rem 1.5rem",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: 500,
    borderRadius: "0.5rem",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    marginBottom: "0.75rem",
  } as React.CSSProperties,
  secondaryButton: {
    width: "100%",
    padding: "0.75rem 1.5rem",
    backgroundColor: "#334155",
    color: "#cbd5e1",
    fontWeight: 500,
    borderRadius: "0.5rem",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
  } as React.CSSProperties,
  footer: {
    marginTop: "1.5rem",
    fontSize: "0.75rem",
    color: "#64748b",
  } as React.CSSProperties,
  link: {
    color: "#60a5fa",
    textDecoration: "none",
  } as React.CSSProperties,
};

function LoginContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const deepLinkScheme = process.env.NEXT_PUBLIC_MOBILE_DEEP_LINK_SCHEME;

  const errorMessage = errorCode
    ? ERROR_MESSAGES[errorCode] || "An error occurred. Please try again."
    : null;

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleDeepLinkError = () => {
    if (deepLinkScheme && errorCode) {
      window.location.href = `${deepLinkScheme}/error?code=${errorCode}`;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {errorMessage && (
          <div style={styles.errorBox}>
            <div style={styles.errorIcon}>
              <svg
                style={{ width: "1.5rem", height: "1.5rem", color: "#f87171" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p style={styles.errorText}>{errorMessage}</p>
          </div>
        )}

        <h1 style={styles.title}>
          {errorMessage ? "Login Failed" : "Welcome Back"}
        </h1>
        <p style={styles.subtitle}>
          {errorMessage
            ? "Please try logging in again."
            : "Sign in to continue to GGVIBE LIVE AI"}
        </p>

        <button onClick={handleLogin} style={styles.button}>
          {errorMessage ? "Try Again" : "Sign in with Replit"}
        </button>

        {deepLinkScheme && errorCode && (
          <button onClick={handleDeepLinkError} style={styles.secondaryButton}>
            Return to App
          </button>
        )}

        <p style={styles.footer}>
          By signing in, you agree to our{" "}
          <a href="/terms" style={styles.link}>
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" style={styles.link}>
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={styles.container}>
          <div style={{ color: "#94a3b8" }}>Loading...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
