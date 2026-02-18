# SEO + Google Search Console Playbook

## Canonical + Host Consistency
- Primary canonical host: `https://www.ggvibe-chatgpt-ai.org`.
- Ensure apex redirects once to www (308 permanent).
- Keep `metadataBase` set to `https://www.ggvibe-chatgpt-ai.org`.

## Sitemap + Robots
- Submit: `https://www.ggvibe-chatgpt-ai.org/sitemap.xml` in Google Search Console.
- Confirm `https://www.ggvibe-chatgpt-ai.org/robots.txt` returns 200.
- Confirm robots allows crawl on site assets (`/_next/*` is not blocked).

## URL Inspection Workflow
1. Inspect homepage (`/`) and core pages (`/privacy`, `/terms`, `/plans`, `/marketplace`, `/seller`, `/login`).
2. Run **Live Test** to confirm CSS/JS resources load.
3. Request indexing on key pages (within GSC quota limits).

## Coverage + Indexing Maintenance
- Watch **Page indexing** for:
  - Alternate page with proper canonical
  - Soft 404
  - Blocked by robots.txt
- Watch **Sitemaps** for fetch/read errors.
- Ensure canonical URL in SERP-facing pages matches www domain.

## Operational Guardrails
- No middleware host redirects (avoid loops/chains).
- Keep redirect chain length at one hop (apex -> www).
- Ensure key marketing pages return 200 and include canonical metadata.
