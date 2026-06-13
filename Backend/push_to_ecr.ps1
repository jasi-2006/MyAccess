# PowerShell Script to Build and Push MyAccess Backend Microservices to AWS ECR

# --- CONFIGURACIÓN ---
$AWS_REGION = "us-east-2"      # Cambia esto por tu región de AWS
$AWS_ACCOUNT_ID = "048124478038"  # Cambia esto por tu ID de cuenta de AWS (12 dígitos)
$TAG = "latest"

$ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Lista de microservicios y sus directorios correspondientes
$SERVICES = @{
    "myaccess-auth-service"          = "auth-service"
    "myaccess-card-service"          = "card-service"
    "myaccess-news-service"          = "news-service"
    "myaccess-notifications-service" = "notifications-service"
    "myaccess-user-service"          = "user-service"
    "myaccess-kong-gateway"          = "kong-gateway"
    "myaccess-validation-service"    = "validation-service"
}

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " INICIANDO SUBIDA DE MICROSERVICIOS A AWS ECR " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# 1. Iniciar sesión en AWS ECR
Write-Host "[1/3] Iniciando sesión en AWS ECR en la región ${AWS_REGION}..." -ForegroundColor Yellow
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al iniciar sesión en AWS ECR. Asegúrate de tener configurado AWS CLI con 'aws configure'."
    exit
}
Write-Host "¡Sesión iniciada con éxito!" -ForegroundColor Green

# 2. Compilar, Crear Repositorio y Subir cada imagen
$currentDir = Get-Location
$count = 1
foreach ($serviceName in $SERVICES.Keys) {
    $folderName = $SERVICES[$serviceName]
    Write-Host ""
    Write-Host "[2/3] [$count/6] Procesando servicio: $serviceName (Carpeta: Backend/$folderName)..." -ForegroundColor Yellow

    # Crear el repositorio en ECR si no existe
    Write-Host "  -> Verificando si existe el repositorio ECR '$serviceName'..." -ForegroundColor Gray
    aws ecr describe-repositories --repository-names $serviceName --region $AWS_REGION 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  -> El repositorio no existe. Creándolo en AWS..." -ForegroundColor Blue
        aws ecr create-repository --repository-name $serviceName --region $AWS_REGION --image-scanning-configuration scanOnPush=true --encryption-configuration encryptionType=AES256 >$null
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Error al crear el repositorio '$serviceName' en AWS ECR."
            exit
        }
        Write-Host "  -> ¡Repositorio creado con éxito!" -ForegroundColor Green
    } else {
        Write-Host "  -> El repositorio ya existe en ECR." -ForegroundColor Green
    }

    # Entrar al directorio del servicio
    Set-Location "$currentDir\$folderName"

    # Modificar temporalmente para Kong Gateway si estamos compilando su dockerfile
    if ($folderName -eq "kong-gateway") {
        Write-Host "  -> Preparando configuración de Kong para AWS..." -ForegroundColor Gray
        # Usamos la plantilla de ECS para compilar
        Copy-Item -Path "kong.ecs.yml.template" -Destination "kong.yml.template" -Force
    }

    # Compilar imagen Docker localmente
    Write-Host "  -> Construyendo imagen Docker local '${serviceName}:${TAG}'..." -ForegroundColor Gray
    docker build -t "${serviceName}:${TAG}" .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Error al compilar la imagen de Docker para $serviceName."
        Set-Location $currentDir
        exit
    }
    Write-Host "  -> Imagen compilada exitosamente." -ForegroundColor Green

    # Etiquetar la imagen para ECR
    $ecrImageTag = "${ECR_REGISTRY}/${serviceName}:${TAG}"
    Write-Host "  -> Etiquetando imagen como '$ecrImageTag'..." -ForegroundColor Gray
    docker tag "${serviceName}:${TAG}" $ecrImageTag

    # Subir a ECR
    Write-Host "  -> Subiendo imagen a AWS ECR (esto puede demorar un poco)..." -ForegroundColor Gray
    docker push $ecrImageTag
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Error al subir la imagen $serviceName a AWS ECR."
        Set-Location $currentDir
        exit
    }
    Write-Host "  -> ¡Imagen subida correctamente a AWS ECR!" -ForegroundColor Green

    $count++
}

# Volver a la carpeta raíz del script
Set-Location $currentDir

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Green
Write-Host " ¡TODAS LAS IMÁGENES SE SUBIERON A AWS ECR CON ÉXITO! " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "Región: $AWS_REGION"
Write-Host "Registro: $ECR_REGISTRY"
