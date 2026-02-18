"use client";

import { useState } from "react";

export default function PlansPage() {
  const [message, setMessage] = useState("");

  async function activate(plan: "MONTHLY" | "ANNUAL") {
    const uid = window.prompt("Dev/Test: enter target uid");
    if (!uid) return;

    const response = await fetch("/api/dev/activate-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, plan, active: true }),
    });
    const payload = await response.json().catch(() => ({}));
    setMessage(response.ok ? `${plan} activated for ${uid}` : payload.message || payload.error || "Activation failed");
  }

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Choose your plan</h1>
      <p style={{ margin: 0, color: "#94a3b8" }}>Marketplace requires an active MONTHLY or ANNUAL plan.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        <div style={{ border: "1px solid #334155", borderRadius: 14, padding: 16 }}>
          <h3>MONTHLY</h3><p>$19/month</p><button onClick={() => activate("MONTHLY")}>Activate (Dev/Admin)</button>
        </div>
        <div style={{ border: "1px solid #334155", borderRadius: 14, padding: 16 }}>
          <h3>ANNUAL</h3><p>$190/year</p><button onClick={() => activate("ANNUAL")}>Activate (Dev/Admin)</button>
        </div>
      </div>
      {message ? <p>{message}</p> : null}
    </section>
  );
}
