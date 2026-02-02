"use client";

import { useEffect, useState } from "react";

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
  iconContainer: {
    width: "4rem",
    height: "4rem",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.5rem",
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
  } as React.CSSProperties,
};

export default function AuthSuccessPage() {
  const [countdown, setCountdown] = useState(2);
  const deepLinkScheme = process.env.NEXT_PUBLIC_MOBILE_DEEP_LINK_SCHEME;

  useEffect(() => {
    if (deepLinkScheme) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = `${deepLinkScheme}/success`;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [deepLinkScheme]);

  const handleReturnToApp = () => {
    if (deepLinkScheme) {
      window.location.href = `${deepLinkScheme}/success`;
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <svg
            style={{ width: "2rem", height: "2rem", color: "#4ade80" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 style={styles.title}>Login Successful!</h1>
        <p style={styles.subtitle}>
          You have been authenticated successfully.
          {countdown > 0 && ` Redirecting in ${countdown}...`}
        </p>
        <button onClick={handleReturnToApp} style={styles.button}>
          {deepLinkScheme ? "Return to App" : "Continue to Dashboard"}
        </button>
      </div>
    </div>
  );
}
