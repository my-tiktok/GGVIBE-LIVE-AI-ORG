type CorsResult = { ok: true; headers: Headers };

const CANONICAL_ORIGIN = 'https://www.ggvibe-chatgpt-ai.org';

function buildAllowedOrigins(): Set<string> {
  const origins = new Set<string>([CANONICAL_ORIGIN]);

  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.add(process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ''));
  }

  return origins;
}

export function buildCorsHeaders(request: Request, requestId: string): CorsResult {
  const origin = request.headers.get('origin');
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Id',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
    'X-Request-Id': requestId,
  });

  if (origin && buildAllowedOrigins().has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  return { ok: true, headers };
}
