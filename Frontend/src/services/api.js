import { Platform } from 'react-native';

// URLs alineadas con render.yaml (name -> https://<name>.onrender.com)
const DEFAULT_GATEWAY_URL = 'https://myaccess-kong.onrender.com';
const DEFAULT_USER_SERVICE_URL = 'https://myaccess-user.onrender.com';
const DEFAULT_NOTIFICATIONS_SERVICE_URL = 'https://myaccess-notification-ichc.onrender.com';
const DEFAULT_CARD_SERVICE_URL = 'https://myaccess-card-7jc2.onrender.com';
const DEFAULT_NEWS_SERVICE_URL = 'https://myaccess-news-9h3h.onrender.com';
const ENV_GATEWAY_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL;
const ENV_USER_SERVICE_URL = process.env.EXPO_PUBLIC_USER_SERVICE_URL;
const ENV_NOTIFICATIONS_SERVICE_URL = process.env.EXPO_PUBLIC_NOTIFICATIONS_SERVICE_URL;
const ENV_CARD_SERVICE_URL = process.env.EXPO_PUBLIC_CARD_SERVICE_URL;
const ENV_NEWS_SERVICE_URL = process.env.EXPO_PUBLIC_NEWS_SERVICE_URL;

function resolveGatewayUrl() {
  const normalizedEnvUrl = String(ENV_GATEWAY_URL || '').trim();

  if (!normalizedEnvUrl || isFrontendHost(normalizedEnvUrl)) {
    return DEFAULT_GATEWAY_URL;
  }

  // Ignore the deprecated Render gateway if it is still configured in Vercel.
  if (normalizedEnvUrl.includes('myaccess-8dfq.onrender.com')) {
    return DEFAULT_GATEWAY_URL;
  }

  return normalizedEnvUrl;
}

function isFrontendHost(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return (
      hostname.endsWith('.vercel.app')
      || hostname === 'vercel.app'
      || hostname === 'localhost'
      || hostname === '127.0.0.1'
    );
  } catch {
    return false;
  }
}

function resolveUserServiceUrl() {
  const normalizedEnvUrl = String(ENV_USER_SERVICE_URL || '').trim();
  if (!normalizedEnvUrl || isFrontendHost(normalizedEnvUrl)) {
    return DEFAULT_USER_SERVICE_URL;
  }
  return normalizedEnvUrl;
}

function resolveNotificationsServiceUrl() {
  const normalizedEnvUrl = String(ENV_NOTIFICATIONS_SERVICE_URL || '').trim();

  if (!normalizedEnvUrl) {
    return DEFAULT_NOTIFICATIONS_SERVICE_URL;
  }

  // Ignore deprecated Render hostnames still configured in Vercel.
  if (
    normalizedEnvUrl.includes('myaccess-notification-1cxp.onrender.com') ||
    normalizedEnvUrl.includes('myaccess-notification.onrender.com')
  ) {
    return DEFAULT_NOTIFICATIONS_SERVICE_URL;
  }

  return normalizedEnvUrl;
}

function resolveCardServiceUrl() {
  const normalizedEnvUrl = String(ENV_CARD_SERVICE_URL || '').trim();
  if (!normalizedEnvUrl) return DEFAULT_CARD_SERVICE_URL;
  if (
    normalizedEnvUrl.includes('myaccess-card-4tuh.onrender.com') ||
    normalizedEnvUrl.includes('myaccess-card.onrender.com')
  ) {
    return DEFAULT_CARD_SERVICE_URL;
  }
  return normalizedEnvUrl;
}

function resolveNewsServiceUrl() {
  const normalizedEnvUrl = String(ENV_NEWS_SERVICE_URL || '').trim();
  if (!normalizedEnvUrl) return DEFAULT_NEWS_SERVICE_URL;
  if (
    normalizedEnvUrl.includes('myaccess-news-ft80.onrender.com') ||
    normalizedEnvUrl.includes('myaccess-news.onrender.com')
  ) {
    return DEFAULT_NEWS_SERVICE_URL;
  }
  return normalizedEnvUrl;
}

const API_GATEWAY_URL =
  resolveGatewayUrl() ||
  Platform.select({
    android: DEFAULT_GATEWAY_URL,
    web: DEFAULT_GATEWAY_URL,
    default: DEFAULT_GATEWAY_URL,
  });

const USER_SERVICE_URL = resolveUserServiceUrl();
const NOTIFICATIONS_SERVICE_URL = resolveNotificationsServiceUrl();
const CARD_SERVICE_URL = resolveCardServiceUrl();
const NEWS_SERVICE_URL = resolveNewsServiceUrl();
let authTokenCache = null;
let refreshTokenCache = null;

// Manejo del token aquí para evitar importación circular
export function saveToken(token, refreshToken) {
  authTokenCache = token || null;
  if (refreshToken !== undefined) {
    refreshTokenCache = refreshToken || null;
  }
  try { localStorage.setItem('authToken', token); } catch {}
  if (refreshToken !== undefined) {
    try { localStorage.setItem('refreshToken', refreshToken); } catch {}
  }
}

export function getToken() {
  if (authTokenCache) return authTokenCache;
  try {
    authTokenCache = localStorage.getItem('authToken');
    return authTokenCache;
  } catch { return null; }
}

export function clearToken() {
  authTokenCache = null;
  refreshTokenCache = null;
  try { localStorage.removeItem('authToken'); } catch {}
  try { localStorage.removeItem('refreshToken'); } catch {}
}

export function getRefreshToken() {
  if (refreshTokenCache) return refreshTokenCache;
  try {
    refreshTokenCache = localStorage.getItem('refreshToken');
    return refreshTokenCache;
  } catch { return null; }
}

async function parsePayload(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

function getErrorMessage(payload) {
  if (!payload) return 'No fue posible completar la solicitud.';
  if (typeof payload === 'string') return payload;
  if (typeof payload.message === 'string' && payload.message.trim()) return payload.message;
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error;
  return 'No fue posible completar la solicitud.';
}

async function refreshAuthToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(`${USER_SERVICE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const payload = await parsePayload(response);
  if (!response.ok) {
    clearToken();
    return null;
  }

  const token = payload?.token || payload?.accessToken || payload?.data?.token || payload?.data?.accessToken;
  const nextRefreshToken = payload?.refreshToken || payload?.data?.refreshToken || refreshToken;
  if (!token) return null;

  saveToken(token, nextRefreshToken);
  return token;
}

export async function apiRequest(path, options = {}) {
  return baseRequest(...resolveRequestTarget(path), options);
}

export async function userServiceRequest(path, options = {}) {
  return baseRequest(USER_SERVICE_URL, path, options);
}

export async function notificationsServiceRequest(path, options = {}) {
  return baseRequest(NOTIFICATIONS_SERVICE_URL, path, options);
}

export async function cardServiceRequest(path, options = {}) {
  return baseRequest(CARD_SERVICE_URL, path, options);
}

export async function newsServiceRequest(path, options = {}) {
  return baseRequest(NEWS_SERVICE_URL, path, options);
}

async function baseRequest(baseUrl, path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const { skipAuth = false, headers, ...fetchOptions } = options;
  const url = `${baseUrl}${path}`;
  const method = fetchOptions.method || 'GET';
  const hasBody = fetchOptions.body !== undefined && fetchOptions.body !== null;
  const hasToken = Boolean(token);

  if (!skipAuth && !hasToken) {
    console.warn('[apiRequest:auth]', {
      method,
      url,
      hasToken,
    });
  }

  const requestHeaders = {
    ...(hasBody && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers || {}),
  };

  let response = await fetch(url, {
    headers: requestHeaders,
    ...fetchOptions,
  });

  if (response.status === 401 && !skipAuth && path !== '/auth/refresh-token') {
    const nextToken = await refreshAuthToken();
    if (nextToken) {
      response = await fetch(url, {
        headers: {
          ...requestHeaders,
          Authorization: `Bearer ${nextToken}`,
        },
        ...fetchOptions,
      });
    }
  }

  const payload = await parsePayload(response);

  if (!response.ok) {
    console.error('[apiRequest]', {
      method,
      url,
      status: response.status,
      hasToken,
      payload,
    });
    const error = new Error(getErrorMessage(payload));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

function resolveRequestTarget(path) {
  // The register/profile flows already have their own CORS and JWT handling in user-service.
  if (path === '/api/v1/register' || path.startsWith('/api/v1/register/')) {
    return [USER_SERVICE_URL, path.replace(/^\/api\/v1/, '')];
  }

  return [API_GATEWAY_URL, path];
}

/** Rutas /uploads/* viven en user-service (también expuestas vía Kong). */
export function resolveImageUrl(url) {
  if (!url) return null;

  const value = String(url).trim();
  if (!value) return null;

  const uploadsBase = USER_SERVICE_URL.replace(/\/+$/, '');
  const gatewayBase = API_GATEWAY_URL.replace(/\/+$/, '');

  const toUploadsUrl = (pathname, search = '') => {
    const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return `${uploadsBase}${path}${search}`;
  };

  if (value.startsWith('/uploads/')) {
    return toUploadsUrl(value);
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsedUrl = new URL(value);

      if (parsedUrl.pathname.startsWith('/uploads/')) {
        return toUploadsUrl(parsedUrl.pathname, parsedUrl.search);
      }

      if (isFrontendHost(parsedUrl.toString())) {
        return null;
      }

      if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
        const targetBase = parsedUrl.pathname.startsWith('/uploads/') ? uploadsBase : gatewayBase;
        parsedUrl.protocol = new URL(targetBase).protocol;
        parsedUrl.hostname = new URL(targetBase).hostname;
        parsedUrl.port = new URL(targetBase).port;
        return parsedUrl.toString();
      }

      return parsedUrl.toString();
    } catch {
      return value;
    }
  }

  if (value.startsWith('/')) {
    return `${gatewayBase}${value}`;
  }

  return `${gatewayBase}/${value.replace(/^\/+/, '')}`;
}

export {
  API_GATEWAY_URL,
  USER_SERVICE_URL,
  NOTIFICATIONS_SERVICE_URL,
  CARD_SERVICE_URL,
  NEWS_SERVICE_URL,
};
