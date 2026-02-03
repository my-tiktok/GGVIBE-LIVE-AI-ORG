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
   * CRITICAL: OpenAI domain verification hits:
   *   /.well-known/openai-apps-challenge
   *
   * Replit + Next App Router can 404 on .well-known routes in production.
   * This rewrite guarantees a 200 by routing to the stable API handler.
   */
  async rewrites() {
    return [
      {
        source: "/.well-known/openai-apps-challenge",
        destination: "/api/openai-apps-challenge",
      },
      // Optional: keep this if you also serve a legacy text file endpoint
      {
        source: "/.well-known/openai-domain-verification.txt",
        destination: "/api/openai-domain-verification",
      },
    ];
  },

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