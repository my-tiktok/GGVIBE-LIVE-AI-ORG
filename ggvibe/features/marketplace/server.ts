import "server-only";
import { randomUUID } from "crypto";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { Listing } from "@/features/marketplace/types";

const memory = new Map<string, Listing>();

function nowIso() {
  return new Date().toISOString();
}

function seed(uid: string) {
  if (memory.size > 0) return;
  const now = nowIso();
  const items: Listing[] = [
    { id: randomUUID(), ownerId: uid, type: "PHYSICAL", title: "Ring Light Pro", description: "Studio-quality ring light for creators.", price: 89, currency: "USD", images: [], status: "active", createdAt: now, updatedAt: now },
    { id: randomUUID(), ownerId: uid, type: "DIGITAL", title: "Viral Caption Pack", description: "200+ short-form caption prompts.", price: 19, currency: "USD", images: [], status: "active", createdAt: now, updatedAt: now },
    { id: randomUUID(), ownerId: uid, type: "FOOD", title: "Creator Meal Prep Box", description: "Healthy weekly food bundle.", price: 49, currency: "USD", images: [], status: "active", createdAt: now, updatedAt: now },
  ];
  items.forEach((x) => memory.set(x.id, x));
}

export async function listListings(params: {
  limit: number;
  cursor?: string;
  query?: string;
  type?: Listing["type"] | "ALL";
  sort?: "newest" | "price_asc" | "price_desc";
}, seedUid: string): Promise<{ items: Listing[]; nextCursor: string | null }> {
  const firestore = getAdminFirestore();
  if (!firestore) {
    seed(seedUid);
    let items = Array.from(memory.values()).filter((x) => x.status === "active");
    if (params.type && params.type !== "ALL") items = items.filter((x) => x.type === params.type);
    if (params.query) {
      const q = params.query.toLowerCase();
      items = items.filter((x) => `${x.title} ${x.description}`.toLowerCase().includes(q));
    }
    if (params.sort === "price_asc") items.sort((a, b) => a.price - b.price);
    else if (params.sort === "price_desc") items.sort((a, b) => b.price - a.price);
    else items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const start = params.cursor ? Number(params.cursor) || 0 : 0;
    const page = items.slice(start, start + params.limit);
    const nextCursor = start + params.limit < items.length ? String(start + params.limit) : null;
    return { items: page, nextCursor };
  }

  let q = firestore.collection("listings").where("status", "==", "active");
  if (params.type && params.type !== "ALL") {
    q = q.where("type", "==", params.type);
  }

  if (params.sort === "price_asc") {
    q = q.orderBy("price", "asc");
  } else if (params.sort === "price_desc") {
    q = q.orderBy("price", "desc");
  } else {
    q = q.orderBy("createdAt", "desc");
  }

  if (params.cursor) {
    const cursorDoc = await firestore.collection("listings").doc(params.cursor).get();
    if (cursorDoc.exists) q = q.startAfter(cursorDoc);
  }
  const snap = await q.limit(params.limit + 1).get();
  let items = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as Omit<Listing, "id">) }));
  if (params.query) items = items.filter((x: Listing) => `${x.title} ${x.description}`.toLowerCase().includes(params.query!.toLowerCase()));
  const visibleItems = items.slice(0, params.limit);
  return {
    items: visibleItems,
    nextCursor: snap.size > params.limit ? snap.docs[params.limit - 1].id : null,
  };
  };
}

export async function getListingById(id: string): Promise<Listing | null> {
  const firestore = getAdminFirestore();
  if (firestore) {
    const snap = await firestore.collection("listings").doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...(snap.data() as Omit<Listing, "id">) };
  }
  return memory.get(id) || null;
}

export async function createListing(payload: Omit<Listing, "id" | "createdAt" | "updatedAt">): Promise<Listing> {
  const listing: Listing = { ...payload, id: randomUUID(), createdAt: nowIso(), updatedAt: nowIso() };
  const firestore = getAdminFirestore();
  if (firestore) {
    await firestore.collection("listings").doc(listing.id).set(listing);
  } else {
    memory.set(listing.id, listing);
  }
  return listing;
}
