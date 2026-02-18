#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-5051}"
BASE_URL="http://127.0.0.1:${PORT}"

NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-verify-secret-verify-secret-1234567890}"
NEXTAUTH_URL="${NEXTAUTH_URL:-$BASE_URL}"
NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-$BASE_URL}"
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-dummy-google-id}"
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-dummy-google-secret}"
GITHUB_CLIENT_ID="${GITHUB_CLIENT_ID:-dummy-github-id}"
GITHUB_CLIENT_SECRET="${GITHUB_CLIENT_SECRET:-dummy-github-secret}"

NEXTAUTH_SECRET="$NEXTAUTH_SECRET" NEXTAUTH_URL="$NEXTAUTH_URL" NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL" \
GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
GITHUB_CLIENT_ID="$GITHUB_CLIENT_ID" GITHUB_CLIENT_SECRET="$GITHUB_CLIENT_SECRET" \
PORT="$PORT" npm run start >/tmp/ggvibe-verify.log 2>&1 &
APP_PID=$!
trap 'kill $APP_PID >/dev/null 2>&1 || true' EXIT

for _ in $(seq 1 50); do
  if curl -fsS "$BASE_URL/" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

assert_code() {
  local path="$1"
  local expected="$2"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL$path")"
  if [[ "$code" != "$expected" ]]; then
    echo "Expected $path -> $expected, got $code" >&2
    exit 1
  fi
}

signin_code="$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/auth/signin")"
if [[ "$signin_code" != "200" && "$signin_code" != "302" && "$signin_code" != "307" ]]; then
  echo "Expected /api/auth/signin -> 200/302/307, got $signin_code" >&2
  exit 1
fi

assert_code '/api/auth/user' '401'
assert_code '/api/auth/health' '200'
health_code="$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/health")"
if [[ "$health_code" != "200" && "$health_code" != "503" ]]; then
  echo "Expected /api/health -> 200/503, got $health_code" >&2
  exit 1
fi
assert_code '/mcp' '200'
mcp_health_code="$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/mcp/health")"
if [[ "$mcp_health_code" != "200" && "$mcp_health_code" != "503" ]]; then
  echo "Expected /mcp/health -> 200/503, got $mcp_health_code" >&2
  exit 1
fi
assert_code '/.well-known/openai-apps-challenge' '200'

assert_code '/.well-known/op' '200'

marketplace_code="$(curl -s -o /tmp/marketplace.json -w '%{http_code}' "$BASE_URL/api/marketplace/listings")"
if [[ "$marketplace_code" != "401" ]]; then
  echo "Expected /api/marketplace/listings unauthenticated -> 401, got $marketplace_code" >&2
  exit 1
fi
if ! grep -q 'unauthorized' /tmp/marketplace.json; then
  echo "Expected unauthorized payload from /api/marketplace/listings" >&2
  exit 1
fi

sitemap="$(curl -fsS "$BASE_URL/sitemap.xml")"
if echo "$sitemap" | grep -Eq '/wallet|/chat|/admin|/seller|/transactions'; then
  echo "Private routes must not appear in sitemap" >&2
  exit 1
fi

robots_txt="$(curl -fsS "$BASE_URL/robots.txt")"
if ! echo "$robots_txt" | grep -q 'Sitemap: https://www.ggvibe-chatgpt-ai.org/sitemap.xml'; then
  echo "robots.txt must include canonical sitemap URL" >&2
  exit 1
fi

login_code="$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/login")"
if [[ "$login_code" == "405" ]]; then
  echo "Expected /api/login to not return 405" >&2
  exit 1
fi

wallet_code="$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/wallet")"
if [[ "$wallet_code" != "307" && "$wallet_code" != "302" ]]; then
  echo "Expected /wallet unauthenticated to redirect, got $wallet_code" >&2
  exit 1
fi

mcp_auth="$(curl -fsS "$BASE_URL/mcp" | node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync(0,'utf8'));process.stdout.write(String(d.auth||''));")"
if [[ "$mcp_auth" != "none" ]]; then
  echo "Expected /mcp auth to be 'none', got '$mcp_auth'" >&2
  exit 1
fi

challenge_headers="$(curl -s -D - -o /tmp/openai-challenge-body.txt "$BASE_URL/.well-known/openai-apps-challenge")"
challenge_body="$(cat /tmp/openai-challenge-body.txt)"
expected_body="$(cat ./public/.well-known/openai-apps-challenge)"
if [[ "$challenge_body" != "$expected_body" ]]; then
  echo "OpenAI challenge response must match static token file" >&2
  exit 1
fi
if ! echo "$challenge_headers" | grep -iq '^content-type: text/plain'; then
  echo "OpenAI challenge content-type must be text/plain" >&2
  exit 1
fi

echo "Auth + MCP contract checks passed"
