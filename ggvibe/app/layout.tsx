import { validateEnvironment } from "@/lib/env-validator";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GGVIBE LIVE AI - Your AI-Powered Chat Assistant",
  description:
    "Experience the next generation of AI-powered conversations with GGVIBE LIVE AI. Chat, create, and collaborate with intelligent AI assistance.",
  metadataBase: new URL("https://www.ggvibe-chatgpt-ai.org"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.ggvibe-chatgpt-ai.org",
    siteName: "GGVIBE LIVE AI",
    title: "GGVIBE LIVE AI - Your AI-Powered Chat Assistant",
    description:
      "Experience the next generation of AI-powered conversations with GGVIBE LIVE AI.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  validateEnvironment();
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
