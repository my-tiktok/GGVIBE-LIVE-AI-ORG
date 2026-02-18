import { createHash } from 'crypto';
import { logRequest } from '@/lib/observability/logger';

const WINDOW_SECONDS = 15 * 60;
const MAX_FAILURES = 5;

type RateLimitDecision = {
  limited: boolean;
  retryAfterSeconds?: number;
  failureCount?: number;
};

type MemoryState = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, MemoryState>();

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function getClientIp(request: Request): string {
  const header = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || 'unknown';
  return header.split(',')[0]?.trim() || 'unknown';
}

function hashValue(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function hashIdentity(email?: string) {
  if (!email) return 'anonymous';
  return hashValue(email.toLowerCase().trim());
}

function getDeviceFingerprint(request: Request) {
  const ip = getClientIp(request);
  const ua = (request.headers.get('user-agent') || 'unknown').slice(0, 120);
  const lang = (request.headers.get('accept-language') || 'unknown').slice(0, 80);
  return hashValue(`${ip}|${ua}|${lang}`);
}

function getKey(request: Request, email?: string) {
  return `login-fail:${getClientIp(request)}:${hashIdentity(email)}:${getDeviceFingerprint(request)}`;
}

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_KV_REST_API_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ''), token };
}

async function upstashCommand(args: string[]): Promise<unknown> {
  const config = getUpstashConfig();
  if (!config) throw new Error('Redis rate limiter is not configured.');

  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([args]),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Rate limiter backend request failed (${response.status}).`);
  }

  const payload = (await response.json()) as Array<{ result: unknown }>;
  return payload[0]?.result;
}

function evaluateMemoryLimit(key: string): RateLimitDecision {
  const now = Date.now();
  const existing = memoryStore.get(key);
  if (!existing || now >= existing.resetAt) {
    return { limited: false, failureCount: 0 };
  }

  if (existing.count >= MAX_FAILURES) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(Math.ceil((existing.resetAt - now) / 1000), 1),
      failureCount: existing.count,
    };
  }

  return { limited: false, failureCount: existing.count };
}

export async function getFailedLoginLimit(request: Request, email?: string): Promise<RateLimitDecision> {
  const key = getKey(request, email);
  const config = getUpstashConfig();

  if (!config) {
    if (isProduction()) {
      throw new Error('Rate limiter backend is required in production.');
    }
    return evaluateMemoryLimit(key);
  }

  const count = Number((await upstashCommand(['GET', key])) ?? 0);
  if (count < MAX_FAILURES) {
    return { limited: false, failureCount: count };
  }

  const ttl = Number((await upstashCommand(['TTL', key])) ?? 1);
  return {
    limited: true,
    retryAfterSeconds: ttl > 0 ? ttl : 1,
    failureCount: count,
  };
}

export async function recordFailedLoginAttempt(
  request: Request,
  email: string | undefined,
  context: { requestId: string; path: string }
): Promise<{ failureCount: number; anomaly: boolean }> {
  const key = getKey(request, email);
  const config = getUpstashConfig();
  const hardLimit = MAX_FAILURES * 2;

  let failureCount = 0;

  if (!config) {
    if (isProduction()) {
      throw new Error('Rate limiter backend is required in production.');
    }

    const now = Date.now();
    const existing = memoryStore.get(key);
    if (!existing || now >= existing.resetAt) {
      memoryStore.set(key, { count: 1, resetAt: now + WINDOW_SECONDS * 1000 });
      failureCount = 1;
    } else {
      existing.count += 1;
      memoryStore.set(key, existing);
      failureCount = existing.count;
    }
  } else {
    failureCount = Number((await upstashCommand(['INCR', key])) ?? 1);
    if (failureCount === 1) {
      await upstashCommand(['EXPIRE', key, String(WINDOW_SECONDS)]);
    }
  }

  const anomaly = failureCount >= hardLimit;
  if (anomaly) {
    logRequest({
      event: 'abuse_signal',
      type: 'ANOMALY',
      requestId: context.requestId,
      method: request.method,
      path: context.path,
      status: 429,
      durationMs: 0,
      ip: getClientIp(request),
      userAgent: (request.headers.get('user-agent') || 'unknown').slice(0, 120),
      details: {
        keyPrefix: 'login-fail',
        failureCount,
        fingerprint: getDeviceFingerprint(request),
      },
    });
  }

  return { failureCount, anomaly };
}
