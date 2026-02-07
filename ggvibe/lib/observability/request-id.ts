import { generateRequestId } from "@/lib/request-id";

export function getRequestId(request: Request): string {
  const header = request.headers.get("x-request-id");
  if (header && header.trim().length > 0) {
    return header;
  }
  return generateRequestId();
}
