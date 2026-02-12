"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/components/auth/auth-provider";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useFirebaseAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading) {
    return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Loading...</main>;
  }

  if (!user) {
    return null;
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0f172a", color: "white" }}>
      <section style={{ width: "100%", maxWidth: 420, padding: 24, border: "1px solid #334155", borderRadius: 12, background: "#111827" }}>
        <h1>Account</h1>
        <p>Email: {user.email}</p>
        <p>Verified: {user.emailVerified ? "Yes" : "No"}</p>
        <button onClick={() => logout()} style={{ padding: 12, width: "100%", background: "#ef4444", color: "white", border: 0, borderRadius: 8 }}>
          Sign out
        </button>
      </section>
    </main>
  );
}
