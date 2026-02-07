import { NextResponse } from "next/server";

export type ApiErrorBody = {
  error: string;
  message: string;
  requestId: string;
};

export function jsonError(
  body: ApiErrorBody,
  status: number,
  headers?: HeadersInit
) {
  return NextResponse.json(body, { status, headers });
}
