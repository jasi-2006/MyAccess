# Docker — MyAccess

## Estructura de contenedores

```
Browser / App móvil
        ↓  :3000
  ┌─────────────┐
  │  frontend   │  nginx sirviendo Expo Web
  └─────────────┘
        ↓  proxy /api/*
  ┌─────────────┐
  │   gateway   │  Spring Cloud Gateway :8080
  └─────────────┘
        ↓  http://backend:9090
  ┌─────────────┐
  │   backend   │  Spring Boot (todos los servicios) :9090
  └─────────────┘
        ↓
  TiDB Cloud (MySQL externo)
```

| Contenedor | Imagen base | Puerto expuesto |
|---|---|---|
| `myaccess-backend` | eclipse-temurin:17-jre-alpine | interno 9090 |
| `myaccess-gateway` | eclipse-temurin:17-jre-alpine | 8080 → host |
| `myaccess-frontend` | nginx:alpine | 3000 → host |

---

## Archivos Docker del proyecto

```
MyAccessClean/
├── docker-compose.yml          ← orquesta los 3 contenedores
├── .env                        ← variables de entorno (NO subir a git)
├── .env.example                ← plantilla de variables
├── DOCKER.md                   ← este archivo
├── Backend/
│   ├── MyAccess/
│   │   └── Dockerfile          ← build del backend principal
│   └── api-gateway/
│       └── Dockerfile          ← build del gateway
└── Frontend/
    ├── Dockerfile              ← build del frontend web
    └── nginx.conf              ← configuración nginx
```

---

## Opción A — Windows con Docker Desktop (WSL2)

### Paso A1 — Instalar Docker Desktop

1. Descarga Docker Desktop desde https://www.docker.com/products/docker-desktop
2. Ejecuta el instalador `.exe` y sigue los pasos
3. Cuando pregunte, marca la opción **"Use WSL 2 instead of Hyper-V"**
4. Reinicia el equipo cuando lo pida
5. Abre Docker Desktop y espera a que el ícono de la ballena en la barra de tareas deje de moverse — eso indica que está listo

Verifica la instalación abriendo PowerShell o CMD:

```powershell
docker --version
docker compose version
```

Deberías ver algo como:
```
Docker version 26.1.1
Docker Compose version v2.27.0
```

### Paso A2 — Clonar el repositorio

Abre PowerShell o CMD en la carpeta donde quieras el proyecto:

```powershell
git clone https://github.com/tu-usuario/tu-repo.git
cd MyAccessClean
```

### Paso A3 — Crear el archivo `.env`

```powershell
copy .env.example .env
```

Abre el `.env` con el bloc de notas o VS Code y completa los valores:

```powershell
notepad .env
```

```env
DB_USERNAME=tu_usuario_tidb
DB_PASSWORD=tu_password_tidb

MAIL_USERNAME=tu_correo@gmail.com
MAIL_PASSWORD=tu_app_password_gmail

JWT_SECRET=alht7XYKujQPw1ourB0c4rIRg4x6RNrqewufShlZoug=
JWT_EXPIRATION=600000
JWT_REFRESH_EXPIRATION=600000
```

Guarda y cierra el archivo.

### Paso A4 — Construir las imágenes

```powershell
docker compose build
```

La primera vez tarda **5-10 minutos** porque descarga Maven, Node y todas las dependencias.
Para ver el detalle de lo que está haciendo:

```powershell
docker compose build --progress=plain
```

### Paso A5 — Levantar los contenedores

```powershell
docker compose up -d
```

Verifica que los 3 estén corriendo:

```powershell
docker compose ps
```

```
NAME                  STATUS          PORTS
myaccess-backend      Up (healthy)    9090/tcp
myaccess-gateway      Up              0.0.0.0:8080->8080/tcp
myaccess-frontend     Up              0.0.0.0:3000->80/tcp
```

Abre el navegador en `http://localhost:3000`

---

## Opción B — WSL2 con Kali Linux (o cualquier distro Linux en Windows)

Esta opción te permite correr Docker **directamente desde la terminal de Kali** sin necesidad de Docker Desktop abierto, usando el motor de Docker que viene con WSL2.

### Paso B1 — Activar WSL2 en Windows

Abre PowerShell **como Administrador** y ejecuta:

```powershell
wsl --install
```

Si ya tienes WSL instalado pero en versión 1, actualiza a WSL2:

```powershell
wsl --set-default-version 2
```

Reinicia el equipo.

### Paso B2 — Instalar Kali Linux desde la Microsoft Store

1. Abre la **Microsoft Store**
2. Busca **"Kali Linux"**
3. Haz clic en **Obtener / Instalar**
4. Una vez instalado, ábrelo desde el menú inicio
5. La primera vez te pedirá crear un usuario y contraseña — ponle lo que quieras, ese será tu usuario de Kali

Verifica que Kali corre en WSL2 (desde PowerShell):

```powershell
wsl --list --verbose
```

Debes ver `VERSION 2` al lado de Kali:

```
  NAME          STATE   VERSION
* kali-linux    Running 2
```

Si dice `VERSION 1`, conviértelo:

```powershell
wsl --set-version kali-linux 2
```

### Paso B3 — Instalar Docker dentro de Kali

Abre la terminal de Kali y ejecuta estos comandos uno por uno:

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar dependencias necesarias
sudo apt install -y ca-certificates curl gnupg lsb-release

# Agregar la clave GPG oficial de Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Agregar el repositorio de Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/debian bookworm stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine y Docker Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

> Kali está basado en Debian, por eso se usa el repositorio de Debian (`bookworm`).

### Paso B4 — Configurar Docker para usarlo sin `sudo`

Por defecto Docker requiere `sudo` en cada comando. Para evitarlo:

```bash
# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER

# Aplicar el cambio sin cerrar sesión
newgrp docker
```

Verifica que funciona sin sudo:

```bash
docker --version
docker compose version
```

### Paso B5 — Iniciar el servicio de Docker en Kali

En WSL2 no hay `systemd` activo por defecto, así que Docker no arranca solo. Debes iniciarlo manualmente cada vez que abras Kali:

```bash
sudo service docker start
```

Para verificar que está corriendo:

```bash
sudo service docker status
```

Debes ver `* Docker is running`.

> **Tip:** Para no tener que escribir esto cada vez, agrégalo al final de tu `~/.bashrc`:
> ```bash
> echo 'sudo service docker start > /dev/null 2>&1' >> ~/.bashrc
> ```
> Esto lo inicia automáticamente cada vez que abres la terminal de Kali.

### Paso B6 — Clonar el repositorio dentro de Kali

Es importante clonar el proyecto **dentro del sistema de archivos de Linux**, no en `/mnt/c/` (que es el disco de Windows). Esto evita problemas de permisos y hace el build mucho más rápido.

```bash
# Ir a tu carpeta home de Linux
cd ~

# Clonar el repositorio
git clone https://github.com/tu-usuario/tu-repo.git
cd MyAccessClean
```

Si ya tienes el proyecto en Windows y no quieres clonar de nuevo, puedes copiarlo:

```bash
cp -r /mnt/c/Users/TU_USUARIO/OneDrive/Desktop/MyAccessClean ~/MyAccessClean
cd ~/MyAccessClean
```

### Paso B7 — Dar permisos de ejecución a los scripts Maven

En Linux los scripts `.sh` necesitan permisos explícitos:

```bash
chmod +x Backend/MyAccess/mvnw
chmod +x Backend/api-gateway/mvnw
```

### Paso B8 — Crear el archivo `.env`

```bash
cp .env.example .env
nano .env
```

Dentro del editor `nano` completa los valores:

```env
DB_USERNAME=tu_usuario_tidb
DB_PASSWORD=tu_password_tidb

MAIL_USERNAME=tu_correo@gmail.com
MAIL_PASSWORD=tu_app_password_gmail

JWT_SECRET=alht7XYKujQPw1ourB0c4rIRg4x6RNrqewufShlZoug=
JWT_EXPIRATION=600000
JWT_REFRESH_EXPIRATION=600000
```

Para guardar en `nano`: presiona `Ctrl + O`, luego `Enter`, luego `Ctrl + X` para salir.

### Paso B9 — Construir las imágenes

```bash
docker compose build
```

Para ver el progreso detallado:

```bash
docker compose build --progress=plain
```

La primera vez tarda **5-10 minutos**.

### Paso B10 — Levantar los contenedores

```bash
docker compose up -d
```

Verifica que los 3 estén corriendo:

```bash
docker compose ps
```

```
NAME                  STATUS          PORTS
myaccess-backend      Up (healthy)    9090/tcp
myaccess-gateway      Up              0.0.0.0:8080->8080/tcp
myaccess-frontend     Up              0.0.0.0:3000->80/tcp
```

### Paso B11 — Acceder desde el navegador de Windows

Aunque los contenedores corren en Kali (WSL2), los puertos se exponen automáticamente en Windows. Abre el navegador de Windows en:

```
http://localhost:3000
```

Esto funciona porque WSL2 hace un bridge automático entre la red de Linux y Windows.

Para probar la API desde la terminal de Kali:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tu_email@gmail.com","password":"tu_password"}'
```

---

## Opción C — Linux nativo (Ubuntu, Debian, Kali instalado directo)

Si tienes Linux instalado directamente en el equipo (no WSL), el proceso es casi igual a la Opción B pero Docker arranca con systemd:

```bash
# Instalar Docker (mismo proceso que B3)
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/debian bookworm stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Habilitar Docker para que arranque con el sistema
sudo systemctl enable docker
sudo systemctl start docker

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

Luego sigue desde el Paso B6 en adelante.

---

## Comandos útiles del día a día

### Ver logs en tiempo real

```bash
# Todos los contenedores a la vez
docker compose logs -f

# Solo el backend
docker compose logs -f backend

# Solo el gateway
docker compose logs -f gateway

# Solo el frontend
docker compose logs -f frontend

# Ver las últimas 50 líneas del backend
docker compose logs --tail=50 backend
```

### Detener los contenedores

```bash
# Detener pero conservar los contenedores
docker compose stop

# Detener y eliminar los contenedores (las imágenes se conservan)
docker compose down

# Detener, eliminar contenedores y volúmenes
docker compose down -v
```

### Reiniciar un solo servicio

```bash
docker compose restart backend
docker compose restart gateway
docker compose restart frontend
```

### Reconstruir después de cambios en el código

```bash
# Reconstruir y levantar todo
docker compose up -d --build

# Reconstruir solo un servicio
docker compose up -d --build backend
docker compose up -d --build gateway
docker compose up -d --build frontend
```

### Entrar a la terminal de un contenedor

```bash
docker exec -it myaccess-backend sh
docker exec -it myaccess-gateway sh
docker exec -it myaccess-frontend sh
```

### Ver el uso de recursos de los contenedores

```bash
docker stats
```

### Limpiar imágenes y caché que ya no se usan

```bash
docker system prune -f
```

---

## Solución de problemas comunes

### `Cannot connect to the Docker daemon`

**Causa:** El servicio de Docker no está corriendo.

```bash
# En WSL2 / Kali
sudo service docker start

# En Linux nativo
sudo systemctl start docker
```

---

### `Communications link failure` — el backend no conecta a la base de datos

**Causa:** TiDB Cloud bloquea la IP del contenedor o las credenciales son incorrectas.

**Solución:**
1. Entra a TiDB Cloud → tu cluster → **Security** → **Allowed IP Addresses**
2. Agrega `0.0.0.0/0` para permitir cualquier IP (solo para desarrollo)
3. Verifica `DB_USERNAME` y `DB_PASSWORD` en el `.env`

---

### `permission denied` al ejecutar `mvnw` durante el build

**Causa:** El script no tiene permisos de ejecución.

```bash
chmod +x Backend/MyAccess/mvnw
chmod +x Backend/api-gateway/mvnw
```

Si el problema persiste después de hacer push al repo:

```bash
git update-index --chmod=+x Backend/MyAccess/mvnw
git update-index --chmod=+x Backend/api-gateway/mvnw
git commit -m "fix: mvnw permissions"
git push
```

---

### `port is already allocated`

**Causa:** El puerto 8080 o 3000 ya está en uso.

Busca qué proceso lo está usando:

```bash
# En Linux / Kali
sudo lsof -i :8080
sudo lsof -i :3000

# En Windows (PowerShell)
netstat -ano | findstr :8080
```

Mata el proceso o cambia el puerto en `docker-compose.yml`:

```yaml
ports:
  - "8081:8080"   # cambia 8080 por un puerto libre
```

---

### El gateway responde `503 Service Unavailable`

**Causa:** El backend todavía no terminó de arrancar (puede tardar hasta 60 segundos la primera vez).

```bash
# Ver si el backend ya está healthy
docker compose ps

# Si sigue en "starting", espera y mira los logs
docker compose logs -f backend
```

Cuando veas en los logs `Started MyAccessApplication`, el backend está listo. Luego:

```bash
docker compose restart gateway
```

---

### El frontend carga pero las peticiones a la API fallan con CORS o 404

**Causa:** El frontend apunta a `localhost:8080` directamente en vez de usar el proxy de nginx.

En `Frontend/src/services/api.js` cambia la URL de `web` a vacío:

```js
const API_GATEWAY_URL = Platform.select({
  android: 'http://10.0.2.2:8080',
  web: '',        // vacío = nginx hace el proxy internamente
  default: 'http://localhost:8080',
});
```

Luego reconstruye el frontend:

```bash
docker compose up -d --build frontend
```

---

### En WSL2/Kali el build es muy lento

**Causa:** El proyecto está en `/mnt/c/` (sistema de archivos de Windows), que es muy lento desde Linux.

**Solución:** Mueve el proyecto al sistema de archivos de Linux:

```bash
cp -r /mnt/c/Users/TU_USUARIO/OneDrive/Desktop/MyAccessClean ~/MyAccessClean
cd ~/MyAccessClean
docker compose up -d --build
```

El build desde `~/` (sistema Linux) es **3-5x más rápido** que desde `/mnt/c/`.

---

### En WSL2 los puertos no son accesibles desde el navegador de Windows

**Causa:** En algunas versiones de Windows 11 el forwarding automático de puertos de WSL2 falla.

**Solución:** Ejecuta esto en PowerShell como Administrador:

```powershell
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$(wsl hostname -I)
netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080 connectaddress=$(wsl hostname -I)
```

---

## Despliegue en producción con Docker en un VPS

Si tienes un servidor Linux (DigitalOcean, AWS EC2, etc.) el proceso es idéntico a la Opción C:

```bash
# Conectarse al servidor
ssh usuario@ip-del-servidor

# Instalar Docker (si no está instalado)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Clonar el repo
git clone https://github.com/tu-usuario/tu-repo.git
cd MyAccessClean

# Crear el .env con valores de producción
nano .env

# Dar permisos a mvnw
chmod +x Backend/MyAccess/mvnw
chmod +x Backend/api-gateway/mvnw

# Construir y levantar
docker compose up -d --build

# Verificar
docker compose ps
```

Para actualizar después de un nuevo push:

```bash
git pull
docker compose up -d --build
```
