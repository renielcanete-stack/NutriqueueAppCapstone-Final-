#!/usr/bin/env bash
set -euo pipefail

BASE=http://localhost:3000
ML=http://localhost:5001

echo "Checking backend health..."
curl -sS "$BASE/api/health/profile/2026-GSU-0101" | jq || true

echo "\nChecking QR route (expected 404 with mock DB)..."
curl -sS -o /dev/stderr -w "\nHTTP_STATUS:%{http_code}\n" -X POST -H "Content-Type: application/json" -d '{"stallId":"test-stall"}' "$BASE/api/qr/route-stall" || true

echo "\nChecking backend ML predict-wait-time..."
curl -sS -X POST -H "Content-Type: application/json" -d '{"stallId":"test-stall","itemsCount":3}' "$BASE/api/ml/predict-wait-time" | jq || true

echo "\nChecking ML service predict-risk..."
curl -sS -X POST -H "Content-Type: application/json" -d '{"dishName":"Pork Adobo","userVector":[1,0,0,0,0]}' "$ML/predict-risk" | jq || true

echo "\nFrontend available at: $BASE/"
