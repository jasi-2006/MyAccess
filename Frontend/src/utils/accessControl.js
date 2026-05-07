export const ROLES = {
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  APRENDIZ: 'APRENDIZ',
};

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
    'Instructor',
    'Fichas',
    'Solicitudes',
    'Historial',
  ],
  [ROLES.APRENDIZ]: [
    'Home',
    'Card',
    'User',
    'Notifications',
    'NotificationDetail',
  ],
};

const ROLE_HOME_ROUTE = {
  [ROLES.ADMIN]: 'Home',
  [ROLES.INSTRUCTOR]: 'Home',
  [ROLES.APRENDIZ]: 'Home',
};

export function normalizeRole(role) {
  const value = String(role || '').trim().toUpperCase();

  if (value === 'ADMINISTRADOR') return ROLES.ADMIN;
  if (value === 'ADMIN') return ROLES.ADMIN;
  if (value === 'INSTRUCTOR') return ROLES.INSTRUCTOR;
  if (value === 'APRENDIZ') return ROLES.APRENDIZ;

  return value;
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
