import { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <section style={{ width: "min(720px, 94vw)", borderRadius: 24, padding: 24, border: "1px solid rgba(255,255,255,.2)", background: "linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.04))", backdropFilter: "blur(16px)", boxShadow: "0 20px 70px rgba(0,0,0,.45), 0 0 40px rgba(255,46,159,.15)" }}>
      {children}
    </section>
  );
}
