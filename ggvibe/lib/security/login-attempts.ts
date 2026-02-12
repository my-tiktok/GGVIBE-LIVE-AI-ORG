type AttemptState = { count: number; resetAt: number };

type AttemptResult = {
  count: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
};

const memoryStore = new Map<string, AttemptState>();

function nowMs() {
  return Date.now();
}

function clientIp(request: Request) {
  const forwarded =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function keyForRequest(request: Request, email?: string) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  return `login_fail:${clientIp(request)}:${normalizedEmail || "anon"}`;
}

function windowState(windowMs: number): AttemptState {
  return { count: 0, resetAt: nowMs() + windowMs };
}

function parseCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

async function redisCommand(command: string[]): Promise<unknown> {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { result?: unknown };
    return payload.result ?? null;
  } catch {
    return null;
  }
}

async function getFailuresFromRedis(key: string): Promise<number | null> {
  const result = await redisCommand(["GET", key]);
  if (result === null) {
    return null;
  }
  return parseCount(result);
}

async function incrementFailureRedis(key: string, windowSeconds: number): Promise<number | null> {
  const countResult = await redisCommand(["INCR", key]);
  if (countResult === null) {
    return null;
  }

  if (parseCount(countResult) === 1) {
    await redisCommand(["EXPIRE", key, String(windowSeconds)]);
  }

  return parseCount(countResult);
}

async function clearFailuresRedis(key: string): Promise<void> {
  await redisCommand(["DEL", key]);
}

function getMemoryState(key: string, windowMs: number): AttemptState {
  const existing = memoryStore.get(key);
  if (!existing || nowMs() >= existing.resetAt) {
    const next = windowState(windowMs);
    memoryStore.set(key, next);
    return next;
  }

  return existing;
}

function getFailureCountMemory(key: string, windowMs: number): number {
  return getMemoryState(key, windowMs).count;
}

function incrementFailureMemory(key: string, windowMs: number): number {
  const state = getMemoryState(key, windowMs);
  state.count += 1;
  memoryStore.set(key, state);
  return state.count;
}

function clearFailuresMemory(key: string): void {
  memoryStore.delete(key);
}

export async function getLoginFailureState(
  request: Request,
  { limit, windowMs, email }: { limit: number; windowMs: number; email?: string }
): Promise<AttemptResult> {
  const key = keyForRequest(request, email);
  const failures =
    (await getFailuresFromRedis(key)) ?? getFailureCountMemory(key, windowMs);
  const retryAfter = Math.max(Math.ceil(windowMs / 1000), 1);

  return {
    count: failures,
    remaining: Math.max(limit - failures, 0),
    resetAt: Math.ceil((nowMs() + windowMs) / 1000),
    retryAfter,
  };
}

export async function recordFailedLoginAttempt(
  request: Request,
  { windowMs, email }: { windowMs: number; email?: string }
): Promise<number> {
  const key = keyForRequest(request, email);
  const windowSeconds = Math.max(Math.ceil(windowMs / 1000), 1);

  const fromRedis = await incrementFailureRedis(key, windowSeconds);
  if (fromRedis !== null) {
    return fromRedis;
  }

  return incrementFailureMemory(key, windowMs);
}

export async function clearFailedLoginAttempts(request: Request, email?: string): Promise<void> {
  const key = keyForRequest(request, email);
  await clearFailuresRedis(key);
  clearFailuresMemory(key);
}
