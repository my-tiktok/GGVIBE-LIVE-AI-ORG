"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useFirebaseAuth } from "@/components/auth/auth-provider";

export default function SignupPage() {
  const { signUpWithEmail } = useFirebaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email, password);
      setSuccess("Account created. Please verify your email before signing in.");
    } catch (err) {
      setError((err as { message?: string }).message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0f172a", color: "white" }}>
      <section style={{ width: "100%", maxWidth: 420, padding: 24, border: "1px solid #334155", borderRadius: 12, background: "#111827" }}>
        <h1>Create account</h1>
        {error && <p style={{ color: "#fca5a5" }}>{error}</p>}
        {success && <p style={{ color: "#86efac" }}>{success}</p>}
        <form onSubmit={handleSubmit}>
          <input style={{ width: "100%", marginBottom: 8, padding: 10 }} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <input style={{ width: "100%", marginBottom: 8, padding: 10 }} type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
          <input style={{ width: "100%", marginBottom: 12, padding: 10 }} type="password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm password" />
          <button type="submit" disabled={loading} style={{ width: "100%", padding: 12, background: "#2563eb", color: "white", border: 0, borderRadius: 8 }}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p style={{ marginTop: 12 }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
