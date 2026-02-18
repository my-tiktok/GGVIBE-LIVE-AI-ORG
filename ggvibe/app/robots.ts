import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/wallet/", "/mcp/", "/auth/"],
    },
    sitemap: "https://www.ggvibe-chatgpt-ai.org/sitemap.xml",
  };
}
