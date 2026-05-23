# Guía de Despliegue del Backend — MyAccess

## Arquitectura

El backend está compuesto por **dos proyectos Spring Boot independientes**:

```
Frontend
   ↓
api-gateway  (puerto 8080 local)  →  valida JWT y enruta peticiones
   ↓
MyAccess     (puerto 9090 local)  →  lógica de negocio + base de datos
   ↓
TiDB Cloud (MySQL)
```

| Proyecto | Carpeta | Rol |
|---|---|---|
| `api-gateway` | `Backend/api-gateway` | Recibe todas las peticiones, valida el token JWT y las redirige al backend |
| `MyAccess` | `Backend/MyAccess` | Contiene todos los servicios: auth, users, cards, news, notifications |

---

## Herramientas necesarias

### Para desplegar en Render (recomendado, gratis)
- Cuenta en [render.com](https://render.com)
- Cuenta en [github.com](https://github.com) con el repositorio subido
- Base de datos MySQL accesible desde internet (el proyecto ya usa **TiDB Cloud**)

### Para desplegar en Railway (alternativa gratis)
- Cuenta en [railway.app](https://railway.app)
- Cuenta en GitHub con el repositorio subido

### Para desplegar en un VPS (DigitalOcean, AWS EC2, etc.)
- Servidor Linux con Java 17 instalado
- Maven 3.8+ instalado
- Acceso SSH al servidor
- Un dominio o IP pública

### Para correr localmente antes de desplegar
- Java 17 ([descargar](https://adoptium.net))
- Maven 3.8+ ([descargar](https://maven.apache.org/download.cgi))
- MySQL local o acceso a TiDB Cloud

---

## Variables de entorno requeridas

Antes de desplegar en cualquier plataforma, ten estos valores a mano:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_USERNAME` | Usuario de la base de datos | `34CYnHYfoLKzGXQ.root` |
| `DB_PASSWORD` | Contraseña de la base de datos | `tu_password` |
| `MAIL_USERNAME` | Correo Gmail para enviar emails | `myapp@gmail.com` |
| `MAIL_PASSWORD` | Contraseña de aplicación de Gmail | `xxxx xxxx xxxx xxxx` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `alht7XYKujQPw1ourB0c4rIRg4x6RNrqewufShlZoug=` |
| `JWT_EXPIRATION` | Duración del token en ms | `600000` |
| `JWT_REFRESH_EXPIRATION` | Duración del refresh token en ms | `600000` |
| `BACKEND_URI` | URL del servicio MyAccess (solo para el gateway) | `https://myaccess-backend.onrender.com` |

> **Importante:** El `JWT_SECRET` debe ser **exactamente el mismo** en `MyAccess` y en `api-gateway`.

---

## Opción 1 — Despliegue en Render (recomendado)

<!-- ### Paso 1 — Subir el código a GitHub -->

<!-- 1. Crea un repositorio en GitHub (puede ser privado) -->
<!-- 2. Asegúrate de que el archivo `.env` esté en el `.gitignore` para no subir credenciales -->
<!-- 3. Sube el proyecto:

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
``` -->

---

### Paso 2 — Desplegar el servicio `MyAccess` (backend principal)

1. Entra a [render.com](https://render.com) e inicia sesión
2. Haz clic en **"New +"** → **"Web Service"**
3. Conecta tu cuenta de GitHub y selecciona el repositorio
4. Configura el servicio con estos valores:

| Campo | Valor |
|---|---|
| Name | `myaccess-backend` |
| Region | `Oregon (US West)` |
| Branch | `main` |
| Root Directory | `Backend/MyAccess` |
| Runtime | `Java` |
| Build Command | `./mvnw clean package -DskipTests` |
| Start Command | `java -jar target/MyAccess-0.0.1-SNAPSHOT.jar` |
| Plan | `Free` |

5. Baja hasta la sección **"Environment Variables"** y agrega una por una:

```
DB_USERNAME        = tu_usuario_tidb
DB_PASSWORD        = tu_password_tidb
MAIL_USERNAME      = tu_correo@gmail.com
MAIL_PASSWORD      = tu_app_password_gmail
JWT_SECRET         = alht7XYKujQPw1ourB0c4rIRg4x6RNrqewufShlZoug=
JWT_EXPIRATION     = 600000
JWT_REFRESH_EXPIRATION = 600000
```

6. Haz clic en **"Create Web Service"**
7. Espera a que el build termine (puede tardar 3-5 minutos)
8. Cuando diga **"Live"**, copia la URL que Render te asigna, por ejemplo:
   `https://myaccess-backend.onrender.com`

---

### Paso 3 — Desplegar el servicio `api-gateway`

1. Haz clic en **"New +"** → **"Web Service"** nuevamente
2. Selecciona el mismo repositorio
3. Configura con estos valores:

| Campo | Valor |
|---|---|
| Name | `myaccess-gateway` |
| Region | `Oregon (US West)` |
| Branch | `main` |
| Root Directory | `Backend/api-gateway` |
| Runtime | `Java` |
| Build Command | `./mvnw clean package -DskipTests` |
| Start Command | `java -jar target/api-gateway-0.0.1-SNAPSHOT.jar` |
| Plan | `Free` |

4. Agrega las variables de entorno:

```
JWT_SECRET    = alht7XYKujQPw1ourB0c4rIRg4x6RNrqewufShlZoug=
BACKEND_URI   = https://myaccess-backend.onrender.com
```

> Reemplaza la URL de `BACKEND_URI` con la URL real que obtuviste en el Paso 2.

5. Haz clic en **"Create Web Service"**
6. Cuando diga **"Live"**, la URL del gateway es la que debes usar en el frontend, por ejemplo:
   `https://myaccess-gateway.onrender.com`

---

### Paso 4 — Actualizar la URL en el Frontend

En el frontend, busca el archivo donde está configurada la URL base de la API y reemplaza `localhost` por la URL del gateway:

```js
// Antes
const API_URL = "http://localhost:8080/api/v1";

// Después
const API_URL = "https://myaccess-gateway.onrender.com/api/v1";
```

---

### Notas importantes sobre el plan gratuito de Render

- Los servicios gratuitos se **duermen después de 15 minutos de inactividad**. La primera petición después de ese tiempo puede tardar 30-60 segundos en responder.
- Cada servicio gratuito tiene **750 horas/mes** de uso activo.
- Si necesitas que el servicio esté siempre activo, debes usar el plan **Starter ($7/mes)**.

---

## Opción 2 — Despliegue en Railway

Railway es más simple que Render y también tiene plan gratuito.

### Paso 1 — Preparar el repositorio

Igual que en Render, el código debe estar en GitHub con el `.env` en el `.gitignore`.

### Paso 2 — Desplegar `MyAccess`

1. Entra a [railway.app](https://railway.app) e inicia sesión con GitHub
2. Haz clic en **"New Project"** → **"Deploy from GitHub repo"**
3. Selecciona tu repositorio
4. Railway detectará que es un proyecto Java/Maven automáticamente
5. Ve a **"Settings"** del servicio y configura:
   - **Root Directory:** `Backend/MyAccess`
   - **Build Command:** `./mvnw clean package -DskipTests`
   - **Start Command:** `java -jar target/MyAccess-0.0.1-SNAPSHOT.jar`
6. Ve a la pestaña **"Variables"** y agrega las mismas variables de entorno que en Render
7. Railway generará una URL pública automáticamente

### Paso 3 — Desplegar `api-gateway`

1. En el mismo proyecto de Railway, haz clic en **"New"** → **"GitHub Repo"**
2. Selecciona el mismo repositorio
3. Configura:
   - **Root Directory:** `Backend/api-gateway`
   - **Build Command:** `./mvnw clean package -DskipTests`
   - **Start Command:** `java -jar target/api-gateway-0.0.1-SNAPSHOT.jar`
4. Agrega las variables:
   ```
   JWT_SECRET   = tu_jwt_secret
   BACKEND_URI  = https://url-de-myaccess.railway.app
   ```

---

## Opción 3 — Despliegue en un VPS (DigitalOcean, AWS EC2, etc.)

Esta opción te da más control y los servicios no se duermen.

### Paso 1 — Conectarse al servidor

```bash
ssh usuario@ip-del-servidor
```

### Paso 2 — Instalar Java 17

```bash
sudo apt update
sudo apt install -y openjdk-17-jdk
java -version
```

### Paso 3 — Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
```

### Paso 4 — Compilar y empaquetar `MyAccess`

```bash
cd Backend/MyAccess
./mvnw clean package -DskipTests
```

Esto genera el archivo `target/MyAccess-0.0.1-SNAPSHOT.jar`.

### Paso 5 — Crear el archivo `.env` en el servidor

```bash
nano .env
```

Pega el contenido:

```
SERVER_PORT=9090
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
MAIL_USERNAME=tu_correo@gmail.com
MAIL_PASSWORD=tu_app_password
JWT_SECRET=tu_jwt_secret
JWT_EXPIRATION=600000
JWT_REFRESH_EXPIRATION=600000
```

### Paso 6 — Ejecutar `MyAccess` en segundo plano

```bash
nohup java -jar target/MyAccess-0.0.1-SNAPSHOT.jar > myaccess.log 2>&1 &
```

### Paso 7 — Compilar y ejecutar `api-gateway`

```bash
cd ../../api-gateway
./mvnw clean package -DskipTests
```

Crea el `.env` del gateway:

```bash
nano .env
```

```
GATEWAY_PORT=8080
JWT_SECRET=tu_jwt_secret
BACKEND_URI=http://localhost:9090
```

Ejecuta:

```bash
nohup java -jar target/api-gateway-0.0.1-SNAPSHOT.jar > gateway.log 2>&1 &
```

### Paso 8 — Verificar que los servicios están corriendo

```bash
curl http://localhost:9090/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"1234"}'
curl http://localhost:8080/api/v1/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"1234"}'
```

---

## Verificar que el despliegue funciona

Sin importar la plataforma, puedes verificar que el backend está activo haciendo una petición al endpoint de login:

```bash
curl -X POST https://myaccess-gateway.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "tu_email@gmail.com", "password": "tu_password"}'
```

Si responde con un JSON que contiene `token`, el despliegue fue exitoso.

---

## Solución de problemas comunes

| Error | Causa probable | Solución |
|---|---|---|
| `Build failed: permission denied ./mvnw` | El script no tiene permisos de ejecución | Ejecuta `git update-index --chmod=+x Backend/MyAccess/mvnw` y `git update-index --chmod=+x Backend/api-gateway/mvnw` y vuelve a hacer push |
| `Communications link failure` | El backend no puede conectarse a TiDB Cloud | Verifica que TiDB Cloud permita conexiones desde cualquier IP (0.0.0.0/0) en la configuración de red |
| `401 Unauthorized` en rutas protegidas | El JWT_SECRET del gateway y del backend no coinciden | Asegúrate de usar exactamente el mismo valor en ambos servicios |
| El servicio tarda 60 segundos en responder | El plan gratuito de Render pone el servicio a dormir | Normal en plan free, considera el plan Starter para producción |
| `Port already in use` en VPS | Otro proceso usa el puerto | Ejecuta `sudo lsof -i :9090` para ver qué proceso es y mátalo con `kill -9 PID` |
