#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-}"
APP_PID=""
PORT="${PORT:-5010}"

cleanup() {
  if [[ -n "${APP_PID}" ]]; then
    kill "${APP_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

if [[ -z "${BASE_URL}" ]]; then
  BASE_URL="http://127.0.0.1:${PORT}"
  NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-01234567890123456789012345678901}" \
  NEXTAUTH_URL="${NEXTAUTH_URL:-http://127.0.0.1:${PORT}}" \
  DATABASE_URL="${DATABASE_URL:-postgresql://test:test@localhost:5432/ggvibe}" \
  GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-dummy}" GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-dummy}" \
  GITHUB_CLIENT_ID="${GITHUB_CLIENT_ID:-dummy}" GITHUB_CLIENT_SECRET="${GITHUB_CLIENT_SECRET:-dummy}" \
  EMAIL_SERVER="${EMAIL_SERVER:-smtp://localhost:25}" EMAIL_FROM="${EMAIL_FROM:-noreply@example.com}" \
  PORT="${PORT}" npm run start >/tmp/ggvibe-verify.log 2>&1 &
  APP_PID=$!

  for _ in $(seq 1 30); do
    if curl -fsS "${BASE_URL}/api/health" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
fi

echo "[verify] Checking /api/auth/signin contract"
AUTH_SIGNIN_HEADERS="$(mktemp)"
AUTH_SIGNIN_STATUS="$(curl -sS -o /dev/null -D "${AUTH_SIGNIN_HEADERS}" -w "%{http_code}" "${BASE_URL}/api/auth/signin")"
if [[ "${AUTH_SIGNIN_STATUS}" != "200" && "${AUTH_SIGNIN_STATUS}" != "302" && "${AUTH_SIGNIN_STATUS}" != "307" ]]; then
  echo "[verify] FAIL: /api/auth/signin returned ${AUTH_SIGNIN_STATUS}"
  cat "${AUTH_SIGNIN_HEADERS}"
  exit 1
fi

echo "[verify] PASS: /api/auth/signin -> ${AUTH_SIGNIN_STATUS}"

echo "[verify] Checking /api/auth/user unauthenticated contract"
AUTH_STATUS="$(curl -sS -o /dev/null -w "%{http_code}" "${BASE_URL}/api/auth/user")"
if [[ "${AUTH_STATUS}" != "401" ]]; then
  echo "[verify] FAIL: GET /api/auth/user returned ${AUTH_STATUS} (expected 401)"
  exit 1
fi

echo "[verify] PASS: GET /api/auth/user -> 401"

echo "[verify] Checking /api/login does not 405"
LOGIN_STATUS="$(curl -sS -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/login")"
if [[ "${LOGIN_STATUS}" == "405" ]]; then
  echo "[verify] FAIL: /api/login returned 405"
  exit 1
fi

echo "[verify] PASS: /api/login -> ${LOGIN_STATUS} (non-405)"
