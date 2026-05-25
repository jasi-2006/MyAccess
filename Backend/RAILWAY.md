# Railway deployment layout

This backend is a monorepo. Railway should deploy each service from its own directory.

## Services

Use one Railway service per backend service:

1. `Backend/user-service`
2. `Backend/card-service`
3. `Backend/news-service`
4. `Backend/notifications-service`

Railway monorepo guidance says each service should define a root directory for the service, and a `railway.json` or `railway.toml` can live inside that directory. Railway also uses a Dockerfile found at the source root, or you can point it explicitly at one. Sources:

- https://docs.railway.com/guides/monorepo
- https://docs.railway.com/deploy/dockerfiles

## Railway setup

For each Railway service:

1. Connect the same GitHub repository.
2. Set the service Root Directory to one of:
   - `/Backend/user-service`
   - `/Backend/card-service`
   - `/Backend/news-service`
   - `/Backend/notifications-service`
3. Keep Dockerfile deployment enabled. Each service already includes:
   - `Dockerfile`
   - `.dockerignore`
   - `railway.json`

## Required variables

### user-service

- `PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `USER_DB_URL`
- `AUTH_DB_URL`
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `JWT_REFRESH_EXPIRATION`
- `RESEND_API_KEY`
- `EMAIL_FROM`

### card-service

- `PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `CARD_DB_URL`
- `JWT_SECRET`

### news-service

- `PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `NEWS_DB_URL`
- `JWT_SECRET`

### notifications-service

- `PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `NOTIFICATIONS_DB_URL`
- `JWT_SECRET`

## Notes

- Do not rely on local `.env` files in Railway. Define variables in Railway service settings.
- The Dockerfiles already bind Spring Boot to `0.0.0.0` and use Railway's `PORT`.
- `user-service` intentionally contains both `user_service` and `auth_service` packages because it works with two datasources (`user_service` and `auth_service`). That is not a deploy blocker for Railway.
