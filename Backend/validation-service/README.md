# Servicio de Validación de Carné (MyAccess)

## Descripción

El **Servicio de Validación** es un microservicio que valida los datos del carné digital del SENA contra la base de datos oficial de Sofia Plus.

### Cambios Recientes

- ✅ **API Key de Amazon Q configurada** para validación con IA
- ✅ **Modo de validación simplificado** - ahora SOLO valida datos (sin generar carné)
- ✅ **Sin dependencias de Selenium** - elimina necesidad de Chromium
- ✅ **Validación con Mock Mode** - funciona sin conexión a Sofia Plus

## Características

- ✅ **Validación de datos en tiempo real**
- ✅ **Comparación con Sofia Plus**
- ✅ **Reporte de discrepancias con explicaciones de IA**
- ✅ **Generación de feedback visual (futuro)**
- ✅ **Soporte para modo offline**

## Configuración

### Archivo `.env`

```env
# Amazon Q API Key para validación con IA
GEMINI_API_KEY=AKIA4RN6K_OEmf86WbboTdi2lWHiAR-Fx9PYXxDnwQsnepv3FUoQ

# Base de Datos - Conexión al user-service
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Configuración del servidor
PORT=5005
DEBUG=true
```

## Endpoints

### `POST /validate-sofia`

Valida los datos del carné contra Sofia Plus.

#### Request Body

```json
{
  "documentType": "C.C",
  "documentNumber": "12345678",
  "password": "contraseña_sofia_plus",
  "useMock": true,
  "localProfile": {
    "fullName": "Juan Pérez",
    "ficha": "2455678",
    "trainingProgram": "ADSO"
  }
}
```

#### Response (Éxito)

```json
{
  "success": true,
  "message": "¡Validación exitosa! Todos los datos coinciden con Sofia Plus.",
  "scrapedData": {
    "fullName": "Juan Perez",
    "ficha": "2455678",
    "trainingProgram": "ADSO",
    "status": "EN FORMACION"
  }
}
```

#### Response (Fallo)

```json
{
  "success": false,
  "message": "La validación detectó discrepancias en los datos. Revisa los campos marcados.",
  "mismatches": [
    {
      "field": "fullName",
      "local": "Juan Pérez",
      "sofia": "Juan Perez",
      "explanation": "El nombre registrado 'Juan Pérez' tiene una discrepancia menor de ortografía..."
    }
  ],
  "scrapedData": {
    "fullName": "Juan Perez",
    "ficha": "2455678",
    "trainingProgram": "ADSO"
  }
}
```

## Ejecución

### Modo Local

```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el servicio
python app.py
```

El servicio estará disponible en: `http://localhost:5005`

### Modo Docker

```bash
# Construir la imagen
docker build -t myaccess-validation .

# Ejecutar
docker run -p 5005:5005 --env-file .env myaccess-validation
```

### Modo Docker Compose

```bash
docker-compose up --build validation-service
```

## Arquitectura

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │
         │ HTTP Request
         │
┌────────▼────────┐
│  Validation     │
│  Service        │
│  (Port 5005)    │
└────────┬────────┘
         │
         │ Comparación con
         │ Sofia Plus/Mock
         │
┌────────▼────────┐
│  Sofia Plus     │
│  (API/Scraper)  │
└─────────────────┘
```

## Estructura del Proyecto

```
validation-service/
├── app.py              # FastAPI principal
├── scraper.py          # Mock scraper (sin Selenium)
├── requirements.txt    # Dependencias
├── Dockerfile          # Configuración Docker
└── .env               # Variables de entorno
```

## Dependencias

- `fastapi` - Framework web
- `uvicorn` - Servidor ASGI
- `google-generativeai` - API de IA para explicaciones
- `pydantic` - Validación de datos
- `python-dotenv` - Carga de variables de entorno
- `pymysql` - Conexión a MySQL

## Configuración de API Key

La **Amazon Q API Key** se configura en el archivo `.env` como `GEMINI_API_KEY`. Esta clave se usa para:

- Generar explicaciones detalladas de discrepancias
- Validar datos con inteligencia artificial
- Mejorar la experiencia del usuario

## Modos de Operación

### 1. **Mock Mode** (Recomendado para desarrollo)
```json
{
  "useMock": true,
  "documentNumber": "12345678"
}
```

### 2. **Modo Producción** (Futuro)
Cuando se implemente la conexión real con Sofia Plus, el servicio se conectará directamente a la API.

## Notas

- El servicio ahora **NO genera carnés** - solo valida datos
- La API key se comparte entre Kong Gateway y Validation Service
- Se usa sistema de mock para evitar dependencia de Selenium
- Las explicaciones de IA mejoran la experiencia del usuario
