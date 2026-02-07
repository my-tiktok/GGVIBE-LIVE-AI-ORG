export type HttpSuccess<T> = {
  ok: true;
  status: number;
  body: T;
};

export type HttpError = {
  ok: false;
  status: number;
  body: {
    error: string;
    message?: string;
    requestId?: string;
  };
};

export type HttpResult<T> = HttpSuccess<T> | HttpError;

export type Ok<T> = HttpSuccess<T>;
export type Err = HttpError;

export function success<T>(body: T, status = 200): HttpSuccess<T> {
  return { ok: true, status, body };
}

export function ok<T>(data: T, status = 200): Ok<T> {
  return success(data, status);
}

export function error(
  errorCode: string,
  status: number,
  message?: string,
  requestId?: string
): HttpError {
  return {
    ok: false,
    status,
    body: { error: errorCode, message, requestId },
  };
}

export function err(message: string, status = 500, requestId?: string): Err {
  return error("error", status, message, requestId);
}

export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}
