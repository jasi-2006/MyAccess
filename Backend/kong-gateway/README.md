# MyAccess Kong Gateway

Este contenedor reemplaza el `api-gateway` de Spring Cloud Gateway para el despliegue de Kong.

## Variables necesarias

- `JWT_SECRET`: el mismo valor Base64 usado por `user-service` para firmar tokens.
- `KONG_PROXY_LISTEN`: en Render debe quedar como `0.0.0.0:10000`.

El Admin API de Kong queda desactivado con `KONG_ADMIN_LISTEN=off`. Para Render
no se necesita exponerlo porque el gateway se configura en modo declarativo con
`kong.yml`.

## Rutas

- `POST /api/v1/auth/**` -> `user-service /auth/**` sin JWT.
- `/uploads/**` -> `user-service /uploads/**` sin JWT.
- `/api/v1/register/**` -> `user-service /register/**` con JWT.
- `/api/v1/authService/**`, `/api/v1/role/**`, `/api/v1/register/audit/**`, `/api/v1/register/permissions/**` -> `auth-service` con JWT.
- `/api/v1/cardService/**` -> `card-service` con JWT.
- `/api/v1/newsService/**` -> `news-service` con JWT.
- `/api/v1/notificationsService/**` -> `notifications-service` con JWT.

Kong valida tokens `HS256` con el plugin `jwt` usando el claim `tokenType=access`.
Despues, el plugin `pre-function` copia los claims `userId`, `emailId` y `role`
a los headers que ya esperan los microservicios:

- `x-User-id`
- `X-User-Email`
- `X-User-role`

Tambien hay `rate-limiting` global de 100 peticiones por minuto.
