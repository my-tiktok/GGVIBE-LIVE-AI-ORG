#!/bin/bash
set -e

BASE_URL="${1:-http://localhost:5000}"
PASS=0
FAIL=0

echo "========================================"
echo "GGVIBE LIVE AI Production Smoke Test"
echo "Base URL: $BASE_URL"
echo "========================================"
echo ""

test_endpoint() {
  local name="$1"
  local method="$2"
  local path="$3"
  local expected_status="$4"
  
  local url="${BASE_URL}${path}"
  local status
  
  if [ "$method" = "GET" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  else
    status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url")
  fi
  
  if [ "$status" = "$expected_status" ]; then
    echo "[PASS] $name: $method $path -> $status"
    ((PASS++))
  else
    echo "[FAIL] $name: $method $path -> $status (expected $expected_status)"
    ((FAIL++))
  fi
}

test_json_field() {
  local name="$1"
  local path="$2"
  local field="$3"
  
  local url="${BASE_URL}${path}"
  local value
  
  value=$(curl -s "$url" | grep -o "\"$field\"" || echo "")
  
  if [ -n "$value" ]; then
    echo "[PASS] $name: $field present in response"
    ((PASS++))
  else
    echo "[FAIL] $name: $field missing from response"
    ((FAIL++))
  fi
}

test_header() {
  local name="$1"
  local path="$2"
  local header="$3"
  
  local url="${BASE_URL}${path}"
  local value
  
  value=$(curl -sI "$url" | grep -i "^$header:" || echo "")
  
  if [ -n "$value" ]; then
    echo "[PASS] $name: $header header present"
    ((PASS++))
  else
    echo "[FAIL] $name: $header header missing"
    ((FAIL++))
  fi
}

echo "--- Health Endpoints ---"
test_endpoint "Legacy health" GET "/api/auth/health" "200"
test_endpoint "V1 health" GET "/api/v1/health" "200"
test_json_field "V1 health requestId" "/api/v1/health" "requestId"
test_json_field "V1 health version" "/api/v1/health" "version"

echo ""
echo "--- Auth Endpoints (Unauthenticated) ---"
test_endpoint "V1 auth user (unauth)" GET "/api/v1/auth/user" "401"
test_endpoint "Legacy auth user (unauth)" GET "/api/auth/user" "401"
test_json_field "V1 auth user error" "/api/v1/auth/user" "error"
test_json_field "V1 auth user requestId" "/api/v1/auth/user" "requestId"

echo ""
echo "--- Chat Endpoints (Unauthenticated) ---"
test_endpoint "V1 chat list (unauth)" GET "/api/v1/chat" "401"

echo ""
echo "--- OAuth Flow ---"
test_endpoint "Login redirect" GET "/api/login" "307"

echo ""
echo "--- Pages ---"
test_endpoint "Homepage" GET "/" "200"
test_endpoint "Login page" GET "/login" "200"
test_endpoint "Auth success page" GET "/auth/success" "200"
test_endpoint "Privacy page" GET "/privacy" "200"
test_endpoint "Terms page" GET "/terms" "200"

echo ""
echo "--- Security Headers ---"
test_header "X-Content-Type-Options" "/" "X-Content-Type-Options"
test_header "X-Frame-Options" "/" "X-Frame-Options"
test_header "Referrer-Policy" "/" "Referrer-Policy"
test_header "X-Request-Id on V1" "/api/v1/health" "X-Request-Id"

echo ""
echo "========================================"
echo "Results: $PASS passed, $FAIL failed"
echo "========================================"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
