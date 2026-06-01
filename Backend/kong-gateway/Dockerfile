FROM kong:3.9

USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends gettext-base \
  && rm -rf /var/lib/apt/lists/*

COPY kong.yml.template /kong/declarative/kong.yml.template
COPY start-kong.sh /start-kong.sh
RUN chmod +x /start-kong.sh

ENV KONG_DATABASE=off \
    KONG_DECLARATIVE_CONFIG=/tmp/kong-declarative.yml \
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

USER kong

EXPOSE 8000 8443

CMD ["/start-kong.sh"]
