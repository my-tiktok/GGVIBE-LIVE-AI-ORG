"use client";

import { useState } from "react";

export default function PayoutsPage() {
  const [method, setMethod] = useState<"BANK_NGN" | "CRYPTO_BTC">("BANK_NGN");
  const [form, setForm] = useState({ name: "", accountNumber: "", accountName: "", btcAddress: "" });
  const [message, setMessage] = useState("");

  async function save() {
    setMessage("");
    const body = method === "BANK_NGN"
      ? { method, bank: { name: form.name, accountNumber: form.accountNumber, accountName: form.accountName } }
      : { method, crypto: { btcAddress: form.btcAddress } };

    const response = await fetch("/api/payouts/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.message || payload.error || "Unable to save payout preference.");
      return;
    }
    setMessage("Payout preference saved.");
  }

  return (
    <section style={{ maxWidth: 680, display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Payout Preferences</h1>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setMethod("BANK_NGN")} style={{ padding: 10, borderRadius: 10, border: "1px solid #334155", background: method === "BANK_NGN" ? "#2563eb" : "#0f172a", color: "white" }}>Bank (NGN)</button>
        <button onClick={() => setMethod("CRYPTO_BTC")} style={{ padding: 10, borderRadius: 10, border: "1px solid #334155", background: method === "CRYPTO_BTC" ? "#2563eb" : "#0f172a", color: "white" }}>Bitcoin</button>
      </div>
      {method === "BANK_NGN" ? (
        <>
          <input placeholder="Bank name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} style={{ padding: 12, borderRadius: 10, border: "1px solid #334155", background: "#020617", color: "#e2e8f0" }} />
          <input placeholder="Account number" value={form.accountNumber} onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))} style={{ padding: 12, borderRadius: 10, border: "1px solid #334155", background: "#020617", color: "#e2e8f0" }} />
          <input placeholder="Account name" value={form.accountName} onChange={(e) => setForm((p) => ({ ...p, accountName: e.target.value }))} style={{ padding: 12, borderRadius: 10, border: "1px solid #334155", background: "#020617", color: "#e2e8f0" }} />
        </>
      ) : (
        <input placeholder="BTC address (bc1..., 1..., 3...)" value={form.btcAddress} onChange={(e) => setForm((p) => ({ ...p, btcAddress: e.target.value }))} style={{ padding: 12, borderRadius: 10, border: "1px solid #334155", background: "#020617", color: "#e2e8f0" }} />
      )}
      {message ? <div style={{ padding: 10, borderRadius: 10, background: "#0b1220", border: "1px solid #334155" }}>{message}</div> : null}
      <button onClick={save} style={{ padding: 12, borderRadius: 10, border: 0, background: "#16a34a", color: "white", fontWeight: 700 }}>Save Payout Method</button>
    </section>
  );
}
