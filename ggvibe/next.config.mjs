/** @type {import('next').NextConfig} */
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const buildAllowedDevOrigins = () => {
  const origins = [];
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    origins.push(
      "https://ggvibe-chatgpt-ai.org",
      "https://www.ggvibe-chatgpt-ai.org",
      "https://ggvibe-live-ai-1.replit.app"
    );
  } else {
    origins.push("http://localhost:5000", "http://127.0.0.1:5000");
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.push(
        process.env.REPLIT_DEV_DOMAIN,
        `https://${process.env.REPLIT_DEV_DOMAIN}`
      );
    }
  }

  return origins;
};

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: join(__dirname, ".."),
  allowedDevOrigins: buildAllowedDevOrigins(),

  /**
   * CRITICAL: Do NOT use rewrites/redirects/middleware for protected paths:
   *   /.well-known/* must be file-backed (served from /public)
   *   /api/health, /mcp must not be intercepted
   * 
   * File-backed routes are served directly by Next.js static handler,
   * ensuring compatibility with all domains and avoiding redirect loops.
   */

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;