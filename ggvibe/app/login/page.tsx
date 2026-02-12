"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/components/auth/auth-provider";

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
    color: "#fff",
    padding: "2rem 1rem",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#111827",
    borderRadius: "12px",
    padding: "1.5rem",
    border: "1px solid #374151",
  },
  input: {
    width: "100%",
    padding: "0.7rem",
    borderRadius: "8px",
    border: "1px solid #4b5563",
    background: "#1f2937",
    color: "#fff",
    marginBottom: "0.75rem",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    marginBottom: "0.5rem",
  },
  secondary: {
    background: "#374151",
  },
  divider: {
    margin: "1rem 0",
    borderTop: "1px solid #374151",
  },
  error: { color: "#fca5a5", marginBottom: "0.75rem" },
  helper: { color: "#9ca3af", fontSize: "0.9rem" },
};

function mapAuthError(error: unknown) {
  const code = (error as { code?: string; message?: string })?.code;
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Incorrect email or password.";
    case "auth/user-not-found":
      return "No account found for this email.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again.";
    case "auth/popup-closed-by-user":
      return "The sign-in popup was closed before completing authentication.";
    default:
      return (error as { message?: string })?.message || "Authentication failed.";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const {
    signInWithGoogle,
    signInWithGithub,
    signInWithPhone,
    verifyPhoneOtp,
  } = useFirebaseAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const withHandling = async (fn: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      await fn();
      router.push("/");
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(payload.message || payload.error || "Authentication failed.");
      }

      router.push("/");
    } catch (err) {
      setError((err as Error).message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneStart = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      await signInWithPhone(phoneNumber);
      setOtpSent(true);
      setInfo("We sent a verification code to your phone.");
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerify = async () => {
    await withHandling(async () => {
      await verifyPhoneOtp(otpCode);
    });
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1>Sign in</h1>
        <p style={styles.helper}>Use email/password, OAuth, or phone number.</p>
        {error && <p style={styles.error}>{error}</p>}
        {info && <p style={{ ...styles.helper, color: "#86efac" }}>{info}</p>}

        <form onSubmit={handleEmailLogin}>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
          />
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            required
            minLength={8}
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in with Email"}
          </button>
        </form>

        <button
          style={{ ...styles.button, ...styles.secondary }}
          onClick={() => withHandling(signInWithGoogle)}
          disabled={loading}
        >
          Continue with Google
        </button>

        <button
          style={{ ...styles.button, ...styles.secondary }}
          onClick={() => withHandling(signInWithGithub)}
          disabled={loading}
        >
          Continue with GitHub
        </button>

        <div style={styles.divider} />
        <input
          style={styles.input}
          type="tel"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          placeholder="Phone number (E.164, e.g. +15555550123)"
        />
        <button
          style={{ ...styles.button, ...styles.secondary }}
          onClick={handlePhoneStart}
          disabled={loading || phoneNumber.length < 8}
        >
          Send SMS code
        </button>

        {otpSent && (
          <>
            <input
              style={styles.input}
              type="text"
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value)}
              placeholder="Enter verification code"
            />
            <button style={styles.button} onClick={handlePhoneVerify} disabled={loading}>
              Verify code
            </button>
          </>
        )}

        <p style={styles.helper}>
          No account? <Link href="/signup">Create one</Link>
        </p>
        <p style={styles.helper}>
          Forgot password? <Link href="/forgot">Reset it</Link>
        </p>
      </section>
    </main>
  );
}
