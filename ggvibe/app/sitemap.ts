import { MetadataRoute } from "next";

const CANONICAL_BASE_URL = "https://www.ggvibe-chatgpt-ai.org";

function getBaseUrl() {
  const configured = process.env.NEXTAUTH_URL;
  if (!configured) {
    return CANONICAL_BASE_URL;
  }

  try {
    return new URL(configured).origin;
  } catch {
    return CANONICAL_BASE_URL;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();

  return ["", "/privacy", "/terms", "/login"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));
}
