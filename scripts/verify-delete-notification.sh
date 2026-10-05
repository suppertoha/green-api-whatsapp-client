#!/usr/bin/env bash
# Проверка DELETE вне браузера (обходит CORS и заголовки axios).
# Использование:
#   export GREEN_ID=720122756930
#   export GREEN_TOKEN=your_api_token
#   export RECEIPT_ID=14
#   ./scripts/verify-delete-notification.sh

set -euo pipefail

: "${GREEN_ID:?Set GREEN_ID}"
: "${GREEN_TOKEN:?Set GREEN_TOKEN}"
: "${RECEIPT_ID:?Set RECEIPT_ID from last ReceiveNotification response}"

URL="https://api.green-api.com/waInstance${GREEN_ID}/DeleteNotification/${GREEN_TOKEN}/${RECEIPT_ID}"

echo "DELETE ${URL//${GREEN_TOKEN}/***}"
curl -i -X DELETE "$URL"
