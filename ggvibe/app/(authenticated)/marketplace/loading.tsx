export default function MarketplaceLoading() {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Marketplace</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 12, background: "#0b1220" }}>
            <div style={{ height: 90, borderRadius: 10, background: "#1e293b", marginBottom: 10 }} />
            <div style={{ height: 14, borderRadius: 6, background: "#1e293b", marginBottom: 8 }} />
            <div style={{ height: 14, borderRadius: 6, background: "#1e293b", width: "70%" }} />
          </div>
        ))}
      </div>
    </section>
  );
}
