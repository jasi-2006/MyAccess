# 🚀 Guía de Despliegue en Render (Microservicios)

Esta guía explica paso a paso cómo redesplegar los **6 microservicios** y el **Kong Gateway** en **Render** utilizando el archivo Blueprint `render.yaml`. Esto reemplaza el despliegue anterior de AWS ECS que se cayó debido a la expiración de tokens/créditos.

---

## 🧸 Arquitectura en Render

En Render, los servicios corren de forma independiente en contenedores Docker y se comunican de manera segura de forma interna mediante la red privada de Render, usando sus nombres de servicio (ej. `http://myaccess-user:10000`).

El único punto de entrada público de internet al Backend es el **Kong Gateway** (`myaccess-kong`), el cual redirige las peticiones del frontend a los microservicios correspondientes y valida los tokens JWT.

---

## 💡 Reanudación de Servicios Existentes (Sin Redesplegar desde cero)

Si **no eliminaste** tus servicios anteriores en Render, sino que simplemente los **pausaste (suspendiste)**, ¡no necesitas redesplegar todo desde cero! Puedes reanudar tu infraestructura existente siguiendo estos pasos:

1. Ve a tu Dashboard de **Render**.
2. Entra a cada uno de tus servicios suspendidos y haz clic en **"Resume"** (Reanudar) para iniciarlos de nuevo:
   * **Gateway (Kong)**: `myaccess-kong` (`https://myaccess-kong.onrender.com`)
   * **User Service**: `myaccess-user` (`https://myaccess-user.onrender.com`)
   * **Auth Service**: `myaccess-auth-3qr9` (`https://myaccess-auth-3qr9.onrender.com`)
   * **Card Service**: `myaccess-card-7jc2` (`https://myaccess-card-7jc2.onrender.com`)
   * **News Service**: `myaccess-news-9h3h` (`https://myaccess-news-9h3h.onrender.com`)
   * **Notification Service**: `myaccess-notification-ichc` (`https://myaccess-notification-ichc.onrender.com`)
3. Sube los cambios actuales de este commit a tu repositorio de GitHub para actualizar las configuraciones de fallback del frontend (`api.js` y `vercel.json`).
4. Al hacer push, **Vercel** compilará el Frontend automáticamente apuntando a tus servicios de Render reanudados.

*Nota: El microservicio `validation-service` (FastAPI) es nuevo. Si deseas usarlo, puedes desplegar únicamente ese servicio en Render y configurar su ruta en Kong, o bien usar el archivo `render.yaml` si decides reconstruir todo desde cero.*

---

## 🛠️ Paso a Paso para el Despliegue

### Paso 1: Subir los Cambios a GitHub
Asegúrate de que los archivos modificados (`render.yaml`, `kong.yml.template`, `start-kong.sh` y el api.js del frontend) estén subidos a tu repositorio de GitHub en tu rama de trabajo actual:
```bash
git add .
git commit -m "feat: configurar despliegue de microservicios en Render"
git push origin <tu-rama>
```

### Paso 2: Crear el Blueprint en Render
1. Entra a tu consola de [Render](https://render.com) e inicia sesión.
2. Haz clic en el botón **"New +"** (arriba a la derecha) y selecciona **"Blueprint"**.
3. Conecta tu repositorio de GitHub `MyAccessClean` (o el correspondiente).
4. Render leerá el archivo `render.yaml` automáticamente y te presentará una lista de los 7 servicios a crear.
5. Elige un nombre para el grupo de recursos (ej. `myaccess-group`) y la rama correcta.
6. Haz clic en **"Approve"** para iniciar la creación.

---

### Paso 3: Configurar las Variables de Entorno

Render te solicitará ingresar las variables de entorno que no tienen un valor por defecto. La mayoría se agrupan en el grupo compartido **`myaccess-shared`**.

#### 1. Variables Compartidas (`myaccess-shared` Env Group)
Configura los siguientes valores en el grupo compartido:
* **`DB_HOST`**: El hostname de tu base de datos TiDB Cloud o MySQL (ej. `gateway01.us-east-1.prod.aws.tidbcloud.com`).
* **`DB_PORT`**: El puerto de conexión de la base de datos (por defecto `4000` para TiDB).
* **`DB_USERNAME`**: El usuario de acceso a la base de datos.
* **`DB_PASSWORD`**: La contraseña del usuario de base de datos.
* **`JWT_SECRET`**: Tu secreto de firma JWT (debe ser el mismo en todos los servicios, ej. un string largo en Base64).

#### 2. Variables de Conexión Específicas
Render te pedirá ingresar las URLs de base de datos y llaves de API específicas para cada servicio:
* **`USER_DB_URL`** (para `myaccess-user`): URL JDBC de conexión (ej. `jdbc:mysql://<tu-db-host>:4000/user_service?sslMode=REQUIRED`).
* **`AUTH_DB_URL`** (para `myaccess-user` y `myaccess-auth`): URL JDBC de conexión (ej. `jdbc:mysql://<tu-db-host>:4000/auth_service?sslMode=REQUIRED`).
* **`CARD_DB_URL`** (para `myaccess-card`): URL JDBC de conexión (ej. `jdbc:mysql://<tu-db-host>:4000/card_service?sslMode=REQUIRED`).
* **`NEWS_DB_URL`** (para `myaccess-news`): URL JDBC de conexión (ej. `jdbc:mysql://<tu-db-host>:4000/news_service?sslMode=REQUIRED`).
* **`NOTIFICATIONS_DB_URL`** (para `myaccess-notification`): URL JDBC de conexión (ej. `jdbc:mysql://<tu-db-host>:4000/notifications_service?sslMode=REQUIRED`).
* **`GEMINI_API_KEY`** (para `myaccess-validation`): Tu API Key de Google Gemini para las explicaciones con IA.
* **`BREVO_API_KEY`, `EMAIL_FROM`, `SMTP_USERNAME`, `SMTP_PASSWORD`**: Configura tus llaves e información de correo para el envío de notificaciones en `myaccess-user`.

Haz clic en **"Apply"** o **"Save"** en Render y comenzará la compilación y despliegue automático de los 7 contenedores.

---

### Paso 4: Configurar el Frontend (Vercel)

Una vez que el servicio `myaccess-kong` esté marcado como **"Live"**, copia su URL pública de Render (ej. `https://myaccess-kong.onrender.com`).

En tu panel de control de **Vercel** para la aplicación Frontend, actualiza las siguientes variables de entorno:

| Variable de Entorno | Valor a Asignar |
|---|---|
| `EXPO_PUBLIC_API_GATEWAY_URL` | `https://myaccess-kong.onrender.com` |
| `EXPO_PUBLIC_USER_SERVICE_URL` | `https://myaccess-kong.onrender.com/api/v1` |
| `EXPO_PUBLIC_NOTIFICATIONS_SERVICE_URL` | `https://myaccess-kong.onrender.com/api/v1` |
| `EXPO_PUBLIC_CARD_SERVICE_URL` | `https://myaccess-kong.onrender.com/api/v1` |
| `EXPO_PUBLIC_NEWS_SERVICE_URL` | `https://myaccess-kong.onrender.com/api/v1` |
| `EXPO_PUBLIC_VALIDATION_SERVICE_URL` | `https://myaccess-kong.onrender.com/api/v1/validationService` |

*Nota: Vercel reconstruirá tu frontend automáticamente con estas nuevas variables de entorno.*

---

## 🔍 Verificación del Despliegue

Puedes verificar que el Gateway y el Backend están respondiendo haciendo una petición HTTP simple al endpoint de estado o de autenticación de Kong.

Ejemplo con `curl`:
```bash
curl -X POST https://myaccess-kong.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@myaccess.com", "password": "tu_password_aqui"}'
```

Si retorna un JSON con un token JWT exitosamente, ¡los servicios están arriba y comunicándose entre sí en Render correctamente!
