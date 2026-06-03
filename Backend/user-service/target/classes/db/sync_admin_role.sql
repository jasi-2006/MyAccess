-- Sincronizar ADMIN en perfil Y en auth (ambas bases deben coincidir)

USE user_service;
UPDATE user_profile
SET nameRole = 'ADMIN'
WHERE LOWER(email) = LOWER('TU_CORREO@ejemplo.com');

USE auth_service;
UPDATE user_auth ua
INNER JOIN roles r ON UPPER(TRIM(r.name_role)) = 'ADMIN'
SET ua.id_role = r.id
WHERE LOWER(ua.email) = LOWER('TU_CORREO@ejemplo.com');

-- Comprobar
SELECT 'user_profile' AS fuente, p.email, p.nameRole AS rol
FROM user_service.user_profile p
WHERE LOWER(p.email) = LOWER('TU_CORREO@ejemplo.com')
UNION ALL
SELECT 'user_auth', ua.email, r.name_role
FROM auth_service.user_auth ua
LEFT JOIN auth_service.roles r ON r.id = ua.id_role
WHERE LOWER(ua.email) = LOWER('TU_CORREO@ejemplo.com');
