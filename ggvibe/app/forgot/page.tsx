"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useFirebaseAuth } from "@/components/auth/auth-provider";

export default function ForgotPasswordPage() {
  const { sendResetEmail } = useFirebaseAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setError(null);

    try {
      await sendResetEmail(email);
      setStatus("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError((err as { message?: string }).message || "Could not send password reset email.");
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0f172a", color: "white" }}>
      <section style={{ width: "100%", maxWidth: 420, padding: 24, border: "1px solid #334155", borderRadius: 12, background: "#111827" }}>
        <h1>Reset password</h1>
        {status && <p style={{ color: "#86efac" }}>{status}</p>}
        {error && <p style={{ color: "#fca5a5" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={{ width: "100%", marginBottom: 12, padding: 10 }} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <button type="submit" style={{ width: "100%", padding: 12, background: "#2563eb", color: "white", border: 0, borderRadius: 8 }}>
            Send reset email
          </button>
        </form>
        <p style={{ marginTop: 12 }}>
          Back to <Link href="/login">sign in</Link>
        </p>
      </section>
    </main>
  );
}
