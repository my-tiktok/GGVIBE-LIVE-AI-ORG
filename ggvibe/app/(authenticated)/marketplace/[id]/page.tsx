import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getUserEntitlements } from "@/lib/entitlements";
import { getListingById } from "@/features/marketplace/server";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return <p>Sign in required.</p>;

  const ent = await getUserEntitlements(user.uid, user.email);
  if (!ent.hasMarketplaceAccess) return <p>Subscription required to view listing details.</p>;

  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  return (
    <article style={{ display: "grid", gap: 12 }}>
      <Link href="/marketplace" style={{ color: "#93c5fd" }}>← Back to Marketplace</Link>
      <h1 style={{ margin: 0 }}>{listing.title}</h1>
      <p style={{ margin: 0, color: "#94a3b8" }}>{listing.type} • {listing.status}</p>
      <div style={{ height: 240, borderRadius: 14, background: "linear-gradient(135deg,#1e293b,#0f172a)" }} />
      <p>{listing.description}</p>
      <strong style={{ fontSize: 24 }}>${listing.price.toFixed(2)} {listing.currency}</strong>
    </article>
  );
}
