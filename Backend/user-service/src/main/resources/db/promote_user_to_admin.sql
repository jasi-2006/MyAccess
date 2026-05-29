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

-- Verificar:
SELECT id, document, full_name, email, nameRole FROM user_profile WHERE nameRole = 'ADMIN';

-- IMPORTANTE: el usuario debe CERRAR SESIÓN y volver a entrar
-- para que el JWT traiga role=ADMIN.
