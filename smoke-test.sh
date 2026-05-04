#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:?Defina BASE_URL}"
FRONTEND_URL="${FRONTEND_URL:-$BASE_URL}"

echo "Testing health..."
curl -fsS "$BASE_URL/health" >/dev/null

echo "Testing readiness..."
curl -fsS "$BASE_URL/ready" >/dev/null

echo "Testing frontend..."
curl -fsS "$FRONTEND_URL" >/dev/null

echo "Smoke tests passed."