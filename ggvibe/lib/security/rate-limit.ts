type RateLimitState = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfterSeconds?: number;
};

const memoryStore = new Map<string, RateLimitState>();

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function getClientIp(request: Request): string {
  const header =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip');
  if (!header) {
    return 'unknown';
  }
  return header.split(',')[0]?.trim() || 'unknown';
}

function getRedisConfig() {
  const url =
    process.env.UPSTASH_REDIS_KV_REST_API_URL ||
    process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_KV_REST_API_TOKEN ||
    process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ''), token };
}

async function redisPipeline(commands: string[][]): Promise<Array<{ result: unknown }>> {
  const config = getRedisConfig();
  if (!config) {
    throw new Error('Rate limiter backend is not configured.');
  }

  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Rate limiter backend request failed (${response.status}).`);
  }

  return (await response.json()) as Array<{ result: unknown }>;
}

async function rateLimitRedis(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const ttlSeconds = Math.max(Math.ceil(windowMs / 1000), 1);

  const incrResponse = await redisPipeline([['INCR', key]]);
  const count = Number(incrResponse[0]?.result ?? 1);

  if (count === 1) {
    await redisPipeline([['EXPIRE', key, String(ttlSeconds)]]);
  }

  const ttlResponse = await redisPipeline([['TTL', key]]);
  const ttl = Math.max(Number(ttlResponse[0]?.result ?? ttlSeconds), 1);
  const resetAtMs = now + ttl * 1000;

  if (count > limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      reset: Math.ceil(resetAtMs / 1000),
      retryAfterSeconds: ttl,
    };
  }

  return {
    allowed: true,
    limit,
    remaining: Math.max(limit - count, 0),
    reset: Math.ceil(resetAtMs / 1000),
  };
}

function rateLimitMemory(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = memoryStore.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit,
      remaining: Math.max(limit - 1, 0),
      reset: Math.ceil(resetAt / 1000),
    };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.max(Math.ceil((existing.resetAt - now) / 1000), 1);
    return {
      allowed: false,
      limit,
      remaining: 0,
      reset: Math.ceil(existing.resetAt / 1000),
      retryAfterSeconds,
    };
  }

  existing.count += 1;
  memoryStore.set(key, existing);

  return {
    allowed: true,
    limit,
    remaining: Math.max(limit - existing.count, 0),
    reset: Math.ceil(existing.resetAt / 1000),
  };
}

export async function rateLimit(
  request: Request,
  {
    limit,
    windowMs,
    keyPrefix,
    keySuffix,
  }: { limit: number; windowMs: number; keyPrefix: string; keySuffix?: string }
): Promise<RateLimitResult> {
  const key = `${keyPrefix}:${keySuffix ?? getClientIp(request)}`;
  const config = getRedisConfig();

  if (config) {
    return rateLimitRedis(key, limit, windowMs);
  }

  if (isProduction()) {
    throw new Error('Rate limiter backend is required in production.');
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn('[rate-limit] Using in-memory rate limiter fallback.');
  }

  return rateLimitMemory(key, limit, windowMs);
}

export function rateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers({
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  });
  if (!result.allowed && result.retryAfterSeconds) {
    headers.set('Retry-After', String(result.retryAfterSeconds));
  }
  return headers;
}
