FROM kong:3.5-alpine

COPY kong.yml /kong/declarative/kong.yml

ENV KONG_DATABASE=off \
    KONG_DECLARATIVE_CONFIG=/kong/declarative/kong.yml \
    KONG_PROXY_ACCESS_LOG=/dev/stdout \
    KONG_ADMIN_ACCESS_LOG=/dev/stdout \
    KONG_PROXY_ERROR_LOG=/dev/stderr \
    KONG_ADMIN_ERROR_LOG=/dev/stderr \
    KONG_PLUGINS=bundled \
    KONG_ADMIN_LISTEN=off

EXPOSE 8000 8443
