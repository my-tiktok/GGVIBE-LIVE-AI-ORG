import { MetadataRoute } from "next";
import { getAdminFirestore } from "@/lib/firebase-admin";

const BASE_URL = "https://www.ggvibe-chatgpt-ai.org";

const CORE_ROUTES: Array<{
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.5 },
  { path: "/plans", changeFrequency: "weekly", priority: 0.7 },
  { path: "/marketplace", changeFrequency: "daily", priority: 0.8 },
  { path: "/seller", changeFrequency: "weekly", priority: 0.6 },
  { path: "/login", changeFrequency: "monthly", priority: 0.4 },
];

async function getPublicListingEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const firestore = getAdminFirestore();
    if (!firestore) return [];

    const snap = await firestore
      .collection("listings")
      .where("status", "==", "active")
      .limit(200)
      .get();

    return snap.docs.map((doc) => ({
      url: `${BASE_URL}/marketplace/${doc.id}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const core = CORE_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const dynamicListings = await getPublicListingEntries();
  return [...core, ...dynamicListings];
}
