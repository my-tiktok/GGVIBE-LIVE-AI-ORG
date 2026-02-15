"use client";

import { signIn } from "next-auth/react";

export function ProviderButtons() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <button aria-label="Continue with Google" onClick={() => signIn("google", { callbackUrl: "/" })} style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(0,245,255,.5)", background: "rgba(0,245,255,.12)", color: "#fff" }}>Continue with Google</button>
      <button aria-label="Continue with GitHub" onClick={() => signIn("github", { callbackUrl: "/" })} style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,46,159,.5)", background: "rgba(255,46,159,.12)", color: "#fff" }}>Continue with GitHub</button>
    </div>
  );
}
