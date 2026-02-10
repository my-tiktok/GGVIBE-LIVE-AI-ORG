type RateLimitState = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
};

const store = new Map<string, RateLimitState>();

function getClientIp(request: Request): string {
  const header =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip");
  if (!header) {
    return "unknown";
  }
  return header.split(",")[0]?.trim() || "unknown";
}

export function rateLimit(
  request: Request,
  {
    limit,
    windowMs,
    keyPrefix,
    keySuffix,
  }: { limit: number; windowMs: number; keyPrefix: string; keySuffix?: string }
): RateLimitResult {
  const now = Date.now();
  const ip = getClientIp(request);
  const key = `${keyPrefix}:${keySuffix ?? ip}`;
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit,
      remaining: Math.max(limit - 1, 0),
      reset: Math.ceil(resetAt / 1000),
    };
  }

  if (existing.count >= limit) {
    const retryAfter = Math.max(Math.ceil((existing.resetAt - now) / 1000), 1);
    return {
      allowed: false,
      limit,
      remaining: 0,
      reset: Math.ceil(existing.resetAt / 1000),
      retryAfter,
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    allowed: true,
    limit,
    remaining: Math.max(limit - existing.count, 0),
    reset: Math.ceil(existing.resetAt / 1000),
  };
}

export function rateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers({
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  });
  if (!result.allowed && result.retryAfter) {
    headers.set("Retry-After", String(result.retryAfter));
  }
  return headers;
}
