#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:5000}"

check_status() {
  local method="$1"
  local path="$2"
  local expected="$3"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' -X "$method" "${BASE_URL}${path}")"
  if [[ "$code" != "$expected" ]]; then
    echo "Expected ${method} ${path} -> ${expected}, got ${code}" >&2
    exit 1
  fi
  echo "PASS ${method} ${path} -> ${code}"
}

check_status GET / 200
check_status GET /market 200
check_status GET /api/market/items 200
check_status GET /robots.txt 200
check_status GET /api/auth/user 401

for path in /api/auth/signin /api/auth/signin/google /api/auth/signin/github /api/login; do
  code="$(curl -s -o /dev/null -w '%{http_code}' "${BASE_URL}${path}")"
  if [[ "$code" != "200" && "$code" != "302" && "$code" != "307" ]]; then
    echo "Expected GET ${path} -> 200/302/307, got ${code}" >&2
    exit 1
  fi
  echo "PASS GET ${path} -> ${code}"
done
