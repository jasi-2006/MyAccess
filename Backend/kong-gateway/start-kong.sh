#!/bin/sh
set -eu

if [ -z "${JWT_SECRET:-}" ]; then
  echo "JWT_SECRET is required for Kong JWT validation." >&2
  exit 1
fi

export JWT_SECRET
envsubst '${JWT_SECRET}' < /kong/declarative/kong.yml.template > /kong/declarative/kong.yml

exec /docker-entrypoint.sh kong docker-start
