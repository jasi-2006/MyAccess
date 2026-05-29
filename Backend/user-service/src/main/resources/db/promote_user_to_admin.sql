-- Dar permisos de administrador a un usuario (user_service / TiDB / MySQL)
-- Ejecuta en la base user_service y ajusta el WHERE según tu usuario.

-- Ver usuarios y su rol actual:
SELECT id, document, full_name, email, nameRole
FROM user_profile
WHERE nameRole LIKE '%admin%'
   OR nameRole LIKE '%andim%'
   OR email LIKE '%andim%'
   OR full_name LIKE '%andim%';

-- Opción 1: por email
UPDATE user_profile
SET nameRole = 'ADMIN'
WHERE email = 'correo@ejemplo.com';

-- Opción 2: por documento
-- UPDATE user_profile SET nameRole = 'ADMIN' WHERE document = '1099682331';

-- Opción 3: corregir typo ANDIM -> ADMIN
UPDATE user_profile
SET nameRole = 'ADMIN'
WHERE UPPER(TRIM(nameRole)) IN ('ANDIM', 'ADMIM', 'ADMINISTRADOR');

-- También sincronizar auth_service (el JWT puede leer id_role si el perfil falla):
USE auth_service;
UPDATE user_auth ua
INNER JOIN roles r ON UPPER(r.name_role) = 'ADMIN'
SET ua.id_role = r.id
WHERE LOWER(ua.email) = LOWER('correo@ejemplo.com');

-- Verificar perfil + auth:
USE user_service;
SELECT p.id, p.email, p.nameRole, ua.id AS auth_id, r.name_role AS auth_role
FROM user_profile p
LEFT JOIN auth_service.user_auth ua ON LOWER(ua.email) = LOWER(p.email)
LEFT JOIN auth_service.roles r ON r.id = ua.id_role
WHERE LOWER(p.email) = LOWER('correo@ejemplo.com');

-- IMPORTANTE: cerrar sesión y volver a entrar para generar un JWT nuevo con role=ADMIN.
