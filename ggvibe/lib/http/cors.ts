type CorsResult = { ok: true; headers: Headers };

export function buildCorsHeaders(request: Request, requestId: string): CorsResult {
  const origin = request.headers.get("origin");
  const headers = new Headers({
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Id",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin",
    "X-Request-Id": requestId,
  });

  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  return { ok: true, headers };
}
