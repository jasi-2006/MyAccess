# 🛡️ MyAccess — Sistema de Gestión y Credenciales

**MyAccess** es una plataforma moderna para la gestión y control de accesos, credenciales digitales, noticias y notificaciones. El sistema está estructurado mediante una arquitectura limpia que soporta tanto una versión simplificada (monolito) como una arquitectura de **microservicios distribuidos** para entornos de producción de gran escala.

---

## 🏗️ Arquitectura y Estructura del Repositorio

El proyecto se divide en las siguientes carpetas principales:

```
MyAccessClean/
├── 📱 Frontend/                 # Aplicación Web e Interfaz de Usuario (React + Tailwind)
├── ⚙️ Backend/                  # Componentes de Servidor y APIs
│   ├── 📦 MyAccess/             # Monolito en Spring Boot (agrupa la lógica de los 5 servicios)
│   ├── 🔑 auth-service/         # Microservicio de Autenticación, Roles y Permisos (Puerto 9095)
│   ├── 👥 user-service/         # Microservicio de Usuarios y Perfiles (Puerto 9091)
│   ├── 💳 card-service/         # Microservicio de Tarjetas y Credenciales (Puerto 9092)
│   ├── 📰 news-service/         # Microservicio de Noticias e Información (Puerto 9093)
│   ├── 🔔 notifications-service/ # Microservicio de Notificaciones y Envíos (Puerto 9094)
│   └── 🌐 kong-gateway/         # API Gateway usando Kong (Puerto 8080/8000)
├── 🐳 docker-compose.yml        # Orquestación de desarrollo local rápida
└── 📄 render.yaml               # Configuración Blueprint para desplegar en Render
```

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React, JavaScript, TailwindCSS, Expo/React Native (según vista de impresión).
- **Backend Core:** Java 17, Spring Boot 3.x, Maven.
- **Base de Datos:** MySQL (compatible con TiDB Cloud Serverless).
- **API Gateway:** Kong Gateway (Declarative Config / DB-less).
- **Contenedores:** Docker & Docker Compose.
- **Nube e Infraestructura:** AWS (ECR, ECS Fargate, Cloud Map, Secrets Manager, ALB) & Render.

---

## 💻 Ejecución en Desarrollo (Local)

### Requisitos Previos
- **Docker & Docker Desktop** instalado y ejecutándose.
- **Node.js** (v18+) instalado para el frontend.
- **Java 17 & Maven** (opcional, si deseas compilar sin Docker).

### Opción A: Ejecución Rápida con Docker Compose (Recomendado)
Para levantar el monolito de backend, el Kong Gateway y el Frontend con un solo comando:

1. Asegúrate de tener el archivo `.env` configurado en la raíz con tus claves.
2. Ejecuta en tu terminal:
   ```bash
   docker-compose up --build
   ```
3. El frontend estará disponible en [http://localhost:3000](http://localhost:3000) y el gateway de Kong en el puerto `8080`.

### Opción B: Ejecución de Microservicios Independientes
Si deseas correr y probar los 5 microservicios de manera individual:
1. Ve al directorio de cada microservicio en `Backend/` (ej. `Backend/user-service`).
2. Configura su archivo `.env` local.
3. Ejecuta el comando de Maven:
   ```bash
   ./mvnw spring-boot:run
   ```

---

## 🚀 Guías de Despliegue en Producción

El proyecto está preparado para desplegarse en dos entornos en la nube:

### 1. Despliegue Rápido en Render (Monolito)
Ideal para pruebas, entornos de staging o proyectos gratuitos.
- Sigue la **[Guía de Despliegue en Render y VPS](file:///c:/Users/MI%20PC/OneDrive/Desktop/MyAccessClean/Backend/DEPLOY.md)** para configurar los servicios usando el archivo `render.yaml`.

### 2. Despliegue en AWS con ECS Fargate (Microservicios)
Recomendado para entornos de producción reales, de alta disponibilidad, seguridad y rendimiento.
- Sigue la **[Guía de Migración y Despliegue en AWS ECS Fargate](file:///c:/Users/MI%20PC/OneDrive/Desktop/MyAccessClean/Backend/AWS_ECS_DEPLOY.md)** para configurar:
  - Repositorios de **Amazon ECR** utilizando el script de automatización **[push_to_ecr.ps1](file:///c:/Users/MI%20PC/OneDrive/Desktop/MyAccessClean/Backend/push_to_ecr.ps1)**.
  - Red privada **AWS VPC** con subredes públicas y privadas.
  - Directorio DNS interno mediante **AWS Cloud Map (Service Discovery)**.
  - Almacén seguro con **AWS Secrets Manager**.
  - Tareas en Fargate utilizando el archivo de plantilla **[ecs-task-definition-template.json](file:///c:/Users/MI%20PC/OneDrive/Desktop/MyAccessClean/Backend/ecs-task-definition-template.json)**.