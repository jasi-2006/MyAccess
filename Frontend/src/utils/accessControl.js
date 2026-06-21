import { getToken } from '../services/api.js';

export const ROLES = {
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  APRENDIZ: 'APRENDIZ',
};

/** Roles que el usuario puede elegir en el registro público (no incluye ADMIN) */
export const PUBLIC_REGISTRATION_ROLES = [ROLES.APRENDIZ, ROLES.INSTRUCTOR];

export function isPublicRegistrationRole(role) {
  return PUBLIC_REGISTRATION_ROLES.includes(normalizeRole(role));
}

export const PUBLIC_ROUTES = [
  'Onboarding',
  'Login',
  'Register',
  'Verification',
  'ForgotPassword',
  'VerifyResetCode',
  'ResetPassword',
];

const ROLE_ROUTE_ACCESS = {
  [ROLES.ADMIN]: '*',
  [ROLES.INSTRUCTOR]: [
    'Home',
    'Card',
    'User',
    'Notifications',
    'NotificationDetail',
    'Historial',
    'SofiaVerification',
  ],
  [ROLES.APRENDIZ]: [
    'Home',
    'Card',
    'Tramite',
    'User',
    'Notifications',
    'NotificationDetail',
    'SofiaVerification',
  ],

};

const ROLE_HOME_ROUTE = {
  [ROLES.ADMIN]: 'Home',
  [ROLES.INSTRUCTOR]: 'Home',
  [ROLES.APRENDIZ]: 'Home',
};

export function normalizeRole(role) {
  const value = String(role || '').trim().toUpperCase();
  if (value === 'ADMINISTRADOR' || value === 'ADMINISTRATOR') return ROLES.ADMIN;
  if (value === 'ADMIN' || value === 'ANDIM' || value === 'ADMIM') return ROLES.ADMIN;
  if (value === 'INSTRUCTOR' || value === 'INSTRUCTORA' || value === 'DIRECTOR_DE_GRUPO' || value === 'DIRECTOR') return ROLES.INSTRUCTOR;
  if (value === 'APRENDIZ' || value === 'ESTUDIANTE' || value === 'STUDENT') return ROLES.APRENDIZ;
  return value;
}

/** Rol efectivo: perfil en BD primero, luego JWT (por si la sesión quedó desactualizada). */
export function resolveUserRole(profile) {
  const fromProfile = profile?.nameRole ?? profile?.name_role ?? profile?.role;
  const fromToken = getRoleFromToken(getToken());
  return normalizeRole(fromProfile || fromToken);
}

/** Texto visible en carnet y pantallas. */
export function getRoleDisplayName(role) {
  const normalized = normalizeRole(role);
  if (normalized === ROLES.ADMIN) return 'Administrador';
  if (normalized === ROLES.INSTRUCTOR) return 'Instructor';
  if (normalized === ROLES.APRENDIZ) return 'Aprendiz';
  return normalized || 'Usuario';
}

export function canAccessRoute(role, routeName) {
  const normalizedRole = normalizeRole(role);
  const access = ROLE_ROUTE_ACCESS[normalizedRole];
  if (PUBLIC_ROUTES.includes(routeName)) return true;
  if (access === '*') return true;
  return Array.isArray(access) && access.includes(routeName);
}

export function getHomeRouteForRole(role) {
  return ROLE_HOME_ROUTE[normalizeRole(role)] || 'Login';
}

export function getRoutesForRole(role) {
  const access = ROLE_ROUTE_ACCESS[normalizeRole(role)];
  return access === '*' ? '*' : access || [];
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  if (typeof atob === 'function') {
    return atob(padded);
  }
  return '';
}

export function getRoleFromToken(token) {
  try {
    const payload = JSON.parse(decodeBase64Url(String(token || '').split('.')[1] || ''));
    return normalizeRole(payload.role);
  } catch {
    return '';
  }
}
