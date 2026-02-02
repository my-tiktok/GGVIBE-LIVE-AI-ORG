// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GGVIBE LIVE AI - Your AI-Powered Chat Assistant",
  description:
    "Experience next-generation AI-powered conversations with GGVIBE LIVE AI. Chat, create, and collaborate with intelligent AI assistance.",
  metadataBase: new URL("https://ggvibe-chatgpt-ai.org"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}