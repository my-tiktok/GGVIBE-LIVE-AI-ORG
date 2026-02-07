import { jsonError } from "@/lib/http/api-response";
import { getCanonicalUrl } from "@/lib/url/base-url";

type CorsResult =
  | { ok: true; headers: Headers }
  | { ok: false; response: Response };

function buildAllowlist(): string[] {
  const configured = process.env.MCP_ALLOWED_ORIGINS;
  if (configured) {
    return configured
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  const origins = new Set<string>();
  try {
    const canonical = getCanonicalUrl();
    if (canonical) {
      origins.add(new URL(canonical).origin);
    }
  } catch {
    // ignore invalid canonical url
  }
  origins.add("http://localhost:5000");
  origins.add("http://127.0.0.1:5000");
  return Array.from(origins);
}

export function buildCorsHeaders(request: Request, requestId: string): CorsResult {
  const origin = request.headers.get("origin");
  const allowlist = buildAllowlist();
  const headers = new Headers({
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Id",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin",
    "X-Request-Id": requestId,
  });

  if (!origin) {
    return { ok: true, headers };
  }

  if (!allowlist.includes(origin)) {
    return {
      ok: false,
      response: jsonError(
        {
          error: "forbidden_origin",
          message: "Origin is not allowed to access MCP.",
          requestId,
        },
        403,
        headers
      ),
    };
  }

  headers.set("Access-Control-Allow-Origin", origin);
  return { ok: true, headers };
}
