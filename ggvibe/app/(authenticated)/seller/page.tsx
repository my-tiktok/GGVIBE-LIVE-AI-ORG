"use client";

import { type FormEvent, useState } from "react";

export default function SellerPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ displayName: "", storeName: "", bio: "", country: "" });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/seller/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setMessage(payload.message || payload.error || "Failed to create profile.");
      return;
    }
    setMessage("Seller profile saved.");
  }

  return (
    <section style={{ maxWidth: 680, display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Seller Profile</h1>
      <p style={{ margin: 0, color: "#94a3b8" }}>Create your seller identity to publish marketplace listings.</p>
      {message ? <div style={{ padding: 10, borderRadius: 10, background: "#0b1220", border: "1px solid #334155" }}>{message}</div> : null}
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        {Object.entries(form).map(([key, value]) => (
          <input key={key} value={value} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} placeholder={key} style={{ padding: 12, borderRadius: 10, border: "1px solid #334155", background: "#020617", color: "#e2e8f0" }} />
        ))}
        <button disabled={loading} style={{ padding: 12, borderRadius: 10, border: 0, background: "#2563eb", color: "white", fontWeight: 700 }}>{loading ? "Saving..." : "Save Seller Profile"}</button>
      </form>
    </section>
  );
}
