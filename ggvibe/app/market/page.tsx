"use client";

import { useEffect, useState } from "react";
import { ListingDoc } from "@/lib/firebase/firestore";

type MarketResponse = {
  requestId: string;
  items: ListingDoc[];
  error?: string;
};

export default function MarketPage() {
  const [items, setItems] = useState<ListingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/market/items", { cache: "no-store" });
      const payload = (await response.json()) as MarketResponse;

      if (!response.ok) {
        throw new Error(payload.error || "Failed to fetch items");
      }

      setItems(payload.items || []);
      if (payload.error) {
        console.error("market route returned soft error", payload.requestId, payload.error);
      }
    } catch (err) {
      console.error("market load failed", err);
      setError("Failed to fetch items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <h1>Marketplace</h1>
      {loading && <p>Loading items...</p>}
      {!loading && error && (
        <div>
          <p style={{ color: "#dc2626" }}>{error}</p>
          <button onClick={() => void load()}>Retry</button>
        </div>
      )}
      {!loading && !error && items.length === 0 && <p>No listings available yet.</p>}
      {!loading && !error && items.length > 0 && (
        <ul style={{ paddingLeft: 18 }}>
          {items.map((item) => (
            <li key={item.listingId || `${item.uid}-${item.createdAt}`}>
              <strong>{item.title}</strong> — ₦{item.priceNGN?.toLocaleString?.() ?? item.priceNGN}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
