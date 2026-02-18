import { getRequestId } from '@/lib/observability/request-id';

type LogType = 'AUTH_ERROR' | 'RATE_LIMIT' | 'SYSTEM_ERROR' | 'VALIDATION_ERROR' | 'INFO' | 'ANOMALY';

type RequestLog = {
  event: string;
  type?: LogType;
  requestId: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  ip: string;
  userId?: string;
  userAgent: string;
  details?: Record<string, unknown>;
};

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}

function truncate(value: string, max = 180): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export function maskEmail(email?: string): string | undefined {
  if (!email || !email.includes('@')) return undefined;
  const [local, domain] = email.split('@');
  if (!local || !domain) return undefined;
  const safeLocal = `${local.slice(0, 1)}***`;
  return `${safeLocal}@${domain}`;
}

export function getRequestMeta(request: Request) {
  const requestId = getRequestId(request);
  const url = new URL(request.url);
  return {
    requestId,
    method: request.method,
    path: url.pathname,
    ip: getClientIp(request),
    userAgent: truncate(request.headers.get('user-agent') || 'unknown'),
    acceptLanguage: truncate(request.headers.get('accept-language') || 'unknown', 120),
  };
}

export function logRequest(params: Omit<RequestLog, 'timestamp'>) {
  const payload: RequestLog = {
    ...params,
    timestamp: new Date().toISOString(),
  };
  console.log(JSON.stringify(payload));
}

export function logError(params: Omit<RequestLog, 'timestamp' | 'event'> & { type: LogType; error?: unknown }) {
  const { error, ...rest } = params;
  logRequest({
    ...rest,
    event: 'api_error',
    details: {
      ...(params.details || {}),
      errorMessage: error instanceof Error ? error.message : String(error ?? 'unknown'),
    },
  });
}
