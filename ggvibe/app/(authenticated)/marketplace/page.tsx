import { getCurrentUser } from "@/lib/current-user";
import { getUserEntitlements } from "@/lib/entitlements";
import { listListings } from "@/features/marketplace/server";
import { MarketplaceShell } from "@/features/marketplace/MarketplaceShell";

function SubscribeCard() {
  return (
    <section style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Subscribe to unlock Marketplace</h1>
      <p style={{ margin: 0, color: "#94a3b8" }}>Choose a plan to browse Physical, Digital, and Food listings.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        <div style={{ border: "1px solid #334155", borderRadius: 14, padding: 16 }}>
          <h3>MONTHLY</h3>
          <p>$19 / month</p>
          <ul><li>Marketplace access</li><li>Seller tools</li><li>AI helper prompts</li></ul>
        </div>
        <div style={{ border: "1px solid #334155", borderRadius: 14, padding: 16 }}>
          <h3>ANNUAL</h3>
          <p>$190 / year</p>
          <ul><li>2 months free equivalent</li><li>Priority features</li><li>Marketplace analytics</li></ul>
        </div>
      </div>
      <a href="/plans" style={{ display: "inline-block", width: "fit-content", padding: "10px 16px", borderRadius: 10, background: "#2563eb", color: "white", textDecoration: "none", fontWeight: 700 }}>View plans</a>
    </section>
  );
}

export default async function MarketplacePage() {
  const user = await getCurrentUser();
  if (!user) return <SubscribeCard />;

  const ent = await getUserEntitlements(user.uid, user.email);
  if (!ent.hasMarketplaceAccess) return <SubscribeCard />;

  const { items } = await listListings({ limit: 24, type: "ALL", sort: "newest" }, user.uid);

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Marketplace</h1>
      <p style={{ margin: 0, color: "#94a3b8" }}>Discover premium creator products and essentials.</p>
      <MarketplaceShell initialListings={items} canCreate />
    </section>
  );
}
