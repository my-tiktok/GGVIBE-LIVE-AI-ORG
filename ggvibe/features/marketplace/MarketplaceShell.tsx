"use client";

import { useMemo, useState } from "react";
import type { Listing } from "@/features/marketplace/types";

type Props = {
  initialListings: Listing[];
  canCreate: boolean;
};

const chips = ["ALL", "PHYSICAL", "DIGITAL", "FOOD"] as const;

export function MarketplaceShell({ initialListings, canCreate }: Props) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<(typeof chips)[number]>("ALL");
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc">("newest");
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    let items = [...initialListings];
    if (type !== "ALL") items = items.filter((x) => x.type === type);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter((x) => `${x.title} ${x.description}`.toLowerCase().includes(q));
    }
    if (sort === "price_asc") items.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") items.sort((a, b) => b.price - a.price);
    if (sort === "newest") items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return items;
  }, [initialListings, query, type, sort]);

  async function createDraft() {
    const response = await fetch("/api/marketplace/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "DIGITAL",
        title: "New listing draft",
        description: "Tell buyers what makes your offer special.",
        price: 0,
        currency: "USD",
        status: "draft",
        images: [],
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setToast(payload.message || payload.error || "Unable to create listing draft.");
      return;
    }

    setToast("Draft created. Refresh to view latest listing.");
  }

  return (
    <section style={{ display: "grid", gap: 14 }}>
      {toast ? <div style={{ background: "#082f49", border: "1px solid #0369a1", padding: 12, borderRadius: 12 }}>{toast}</div> : null}
      <div style={{ display: "grid", gap: 10, background: "#0b1220", border: "1px solid #1f2937", padding: 14, borderRadius: 14 }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, bundles, food..." style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #334155", background: "#020617", color: "#e2e8f0" }} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {chips.map((chip) => (
            <button key={chip} onClick={() => setType(chip)} style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid #334155", background: type === chip ? "#2563eb" : "#0f172a", color: "#e2e8f0" }}>{chip}</button>
          ))}
          <select value={sort} onChange={(e) => setSort(e.target.value as "newest" | "price_asc" | "price_desc")} style={{ marginLeft: "auto", borderRadius: 10, background: "#020617", color: "#e2e8f0", border: "1px solid #334155", padding: "8px 12px" }}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {canCreate ? (
        <button onClick={createDraft} style={{ border: 0, borderRadius: 12, padding: "12px 16px", background: "linear-gradient(90deg,#2563eb,#9333ea)", color: "white", fontWeight: 700 }}>
          Create Listing Draft
        </button>
      ) : null}

      {filtered.length === 0 ? (
        <div style={{ border: "1px dashed #334155", borderRadius: 12, padding: 24, textAlign: "center", color: "#94a3b8" }}>
          No listings matched your filters yet.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
          {filtered.map((item) => (
            <a key={item.id} href={`/marketplace/${item.id}`} style={{ textDecoration: "none", color: "inherit", background: "#0b1220", border: "1px solid #1f2937", borderRadius: 14, padding: 12, minHeight: 180 }}>
              <div style={{ height: 90, borderRadius: 10, background: "linear-gradient(135deg,#1e293b,#0f172a)", marginBottom: 10 }} />
              <p style={{ margin: "0 0 4px 0", color: "#93c5fd", fontSize: 12 }}>{item.type}</p>
              <h3 style={{ margin: 0, fontSize: 16 }}>{item.title}</h3>
              <p style={{ margin: "8px 0", color: "#94a3b8", fontSize: 13 }}>{item.description.slice(0, 72)}</p>
              <strong>${item.price.toFixed(2)} {item.currency}</strong>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
