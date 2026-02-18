import { getAiConfigStatus } from "@/features/ai/config";

export default function DashboardPage() {
  const ai = getAiConfigStatus();

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Dashboard</h1>
      {ai.configured ? (
        <div style={{ border: "1px solid #14532d", background: "#052e16", borderRadius: 12, padding: 14 }}>
          AI helper is configured. Ask AI actions are enabled across workflows.
        </div>
      ) : (
        <div style={{ border: "1px solid #334155", background: "#0b1220", borderRadius: 12, padding: 14 }}>
          <h3 style={{ marginTop: 0 }}>AI is not configured yet</h3>
          <p style={{ margin: "0 0 8px 0", color: "#94a3b8" }}>Set required environment variables to enable AI helpers.</p>
          <code>Missing: {ai.missingEnv.join(", ")}</code>
          <div style={{ marginTop: 10 }}>
            <button disabled style={{ opacity: 0.6, padding: "10px 14px", borderRadius: 8 }}>Send AI Prompt (disabled)</button>
          </div>
        </div>
      )}
    </section>
  );
}
