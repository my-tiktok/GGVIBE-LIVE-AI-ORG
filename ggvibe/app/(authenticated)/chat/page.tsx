"use client";

import { useEffect, useState } from "react";

type ChatHealth =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "missing_ai_env"; missingEnv: string[] }
  | { status: "unauthorized" }
  | { status: "error"; message: string };

export default function ChatPage() {
  const [state, setState] = useState<ChatHealth>({ status: "loading" });

  useEffect(() => {
    const run = async () => {
      const response = await fetch("/api/v1/chat", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setState({ status: "unauthorized" });
        return;
      }

      const ai = payload?.ai;
      if (ai?.status === "missing_ai_env") {
        setState({ status: "missing_ai_env", missingEnv: ai.missingEnv || [] });
        return;
      }

      if (response.ok) {
        setState({ status: "ready" });
        return;
      }

      setState({ status: "error", message: payload?.message || "Unable to load chat." });
    };

    run().catch(() => setState({ status: "error", message: "Unable to load chat." }));
  }, []);

  const disabled = state.status !== "ready";

  return (
    <section style={{ display: "grid", gap: 12, maxWidth: 760 }}>
      <h1 style={{ margin: 0 }}>AI Chat</h1>
      {state.status === "missing_ai_env" ? (
        <div style={{ border: "1px solid #334155", background: "#0b1220", borderRadius: 12, padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>AI is not configured yet.</h3>
          <p style={{ margin: 0, color: "#94a3b8" }}>Ask your admin to configure AI environment variables.</p>
          <code>Missing: {state.missingEnv.join(", ")}</code>
        </div>
      ) : null}
      {state.status === "unauthorized" ? <p style={{ color: "#fca5a5" }}>Please sign in to continue.</p> : null}
      {state.status === "error" ? <p style={{ color: "#fca5a5" }}>{state.message}</p> : null}

      <textarea placeholder="Ask AI anything..." disabled={disabled} style={{ minHeight: 130, padding: 12, borderRadius: 10, border: "1px solid #334155", background: "#020617", color: "#e2e8f0" }} />
      <button disabled={disabled} style={{ width: "fit-content", padding: "10px 14px", borderRadius: 10, border: 0, background: disabled ? "#475569" : "#2563eb", color: "white", fontWeight: 700 }}>Send</button>
    </section>
  );
}
