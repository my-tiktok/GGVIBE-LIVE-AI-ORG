"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function MagicLinkButton() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleMagicLink = async () => {
    setStatus(null);
    const res = await signIn("email", { email, redirect: false, callbackUrl: "/" });
    if (res?.ok) setStatus("Magic link sent. Check your inbox.");
    else setStatus(`Magic link failed (${res?.status ?? "unknown"}).`);
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <label htmlFor="magic-email" style={{ color: "#d6e6ff" }}>Email magic link</label>
      <input id="magic-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,.2)", background: "rgba(13,11,31,.65)", color: "#fff" }} />
      <button onClick={handleMagicLink} style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.08)", color: "#fff" }}>Send magic link</button>
      {status ? <p aria-live="polite" style={{ margin: 0, color: "#9ee6ff" }}>{status}</p> : null}
    </div>
  );
}
