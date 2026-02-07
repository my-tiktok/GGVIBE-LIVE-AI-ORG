export function logMcpRequest(params: {
  requestId: string;
  method: string;
  path: string;
  status: number;
  latencyMs: number;
}) {
  const { requestId, method, path, status, latencyMs } = params;
  console.log(
    JSON.stringify({
      event: "mcp_request",
      requestId,
      method,
      path,
      status,
      latencyMs,
    })
  );
}
