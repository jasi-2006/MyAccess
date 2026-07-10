#!/bin/sh
set -eu

if [ -z "${JWT_SECRET:-}" ]; then
  echo "JWT_SECRET is required for Kong JWT validation." >&2
  exit 1
fi

export JWT_SECRET
# /kong/declarative is not writable as USER kong; use /tmp for generated config.
CONFIG_OUT="${KONG_DECLARATIVE_CONFIG:-/tmp/kong-declarative.yml}"
envsubst '${JWT_SECRET} ${USER_SERVICE_URL} ${AUTH_SERVICE_URL} ${CARD_SERVICE_URL} ${NEWS_SERVICE_URL} ${NOTIFICATIONS_SERVICE_URL} ${VALIDATION_SERVICE_URL}' < /kong/declarative/kong.yml.template > "$CONFIG_OUT"
export KONG_DECLARATIVE_CONFIG="$CONFIG_OUT"

exec /docker-entrypoint.sh kong docker-start
