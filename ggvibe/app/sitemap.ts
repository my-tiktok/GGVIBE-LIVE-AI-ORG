import { MetadataRoute } from "next";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  return CORE_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
