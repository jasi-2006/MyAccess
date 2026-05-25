FROM kong:3.9

COPY kong.yml /kong/declarative/kong.yml

ENV KONG_DATABASE=off \
    KONG_DECLARATIVE_CONFIG=/kong/declarative/kong.yml \
    KONG_PROXY_ACCESS_LOG=/dev/stdout \
    KONG_ADMIN_ACCESS_LOG=/dev/stdout \
    KONG_PROXY_ERROR_LOG=/dev/stderr \
    KONG_ADMIN_ERROR_LOG=/dev/stderr \
    KONG_PLUGINS=bundled \
    KONG_ADMIN_LISTEN=off \
    KONG_NGINX_WORKER_PROCESSES=1 \
    KONG_NGINX_WORKER_CONNECTIONS=512 \
    KONG_MEM_CACHE_SIZE=32m \
    KONG_LOG_LEVEL=notice \
    KONG_ANONYMOUS_REPORTS=off

EXPOSE 8000 8443
