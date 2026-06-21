import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';
const isLocalWeb =
  isWeb &&
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// On production HTTPS web (Vercel), we must use relative URLs to trigger Vercel rewrites and avoid Mixed Content.
// On local web (HTTP) or mobile platforms, we can request the HTTP ALB URL directly.
const useRelative = isWeb && !isLocalWeb;

const ALB_URL = 'http://myaccess-alb-878398065.us-east-2.elb.amazonaws.com';

const DEFAULT_GATEWAY_URL = useRelative ? '' : ALB_URL;
const DEFAULT_USER_SERVICE_URL = useRelative ? '/api/v1' : `${ALB_URL}/api/v1`;
const DEFAULT_NOTIFICATIONS_SERVICE_URL = useRelative ? '/api/v1' : `${ALB_URL}/api/v1`;
const DEFAULT_CARD_SERVICE_URL = useRelative ? '/api/v1' : `${ALB_URL}/api/v1`;
const DEFAULT_NEWS_SERVICE_URL = useRelative ? '/api/v1' : `${ALB_URL}/api/v1`;
const DEFAULT_VALIDATION_SERVICE_URL = useRelative ? '/api/v1/validation' : `${ALB_URL}/api/v1/validation`;

const ENV_GATEWAY_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL;
const ENV_USER_SERVICE_URL = process.env.EXPO_PUBLIC_USER_SERVICE_URL;
const ENV_NOTIFICATIONS_SERVICE_URL = process.env.EXPO_PUBLIC_NOTIFICATIONS_SERVICE_URL;
const ENV_CARD_SERVICE_URL = process.env.EXPO_PUBLIC_CARD_SERVICE_URL;
const ENV_NEWS_SERVICE_URL = process.env.EXPO_PUBLIC_NEWS_SERVICE_URL;
const ENV_VALIDATION_SERVICE_URL = process.env.EXPO_PUBLIC_VALIDATION_SERVICE_URL;

function shouldIgnoreEnvUrl(url) {
  if (!url) return true;
  const normalized = String(url).trim().toLowerCase();
  
  // Deprecated Render URLs are always ignored
  if (normalized.includes('.onrender.com')) {
    return true;
  }

  // If we are running on an HTTPS page, we MUST ignore any insecure HTTP URLs
  // to prevent browser Mixed Content blocking.
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (normalized.startsWith('http://')) {
      return true;
    }
  }

  return false;
}

function resolveGatewayUrl() {
  const normalizedEnvUrl = String(ENV_GATEWAY_URL || '').trim();

  if (shouldIgnoreEnvUrl(normalizedEnvUrl)) {
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
  if (shouldIgnoreEnvUrl(normalizedEnvUrl)) {
    return DEFAULT_USER_SERVICE_URL;
  }
  return normalizedEnvUrl;
}

function resolveNotificationsServiceUrl() {
  const normalizedEnvUrl = String(ENV_NOTIFICATIONS_SERVICE_URL || '').trim();
  if (shouldIgnoreEnvUrl(normalizedEnvUrl)) {
    return DEFAULT_NOTIFICATIONS_SERVICE_URL;
  }
  return normalizedEnvUrl;
}

function resolveCardServiceUrl() {
  const normalizedEnvUrl = String(ENV_CARD_SERVICE_URL || '').trim();
  if (shouldIgnoreEnvUrl(normalizedEnvUrl)) {
    return DEFAULT_CARD_SERVICE_URL;
  }
  return normalizedEnvUrl;
}

function resolveNewsServiceUrl() {
  const normalizedEnvUrl = String(ENV_NEWS_SERVICE_URL || '').trim();
  if (shouldIgnoreEnvUrl(normalizedEnvUrl)) {
    return DEFAULT_NEWS_SERVICE_URL;
  }
  return normalizedEnvUrl;
}

function resolveValidationServiceUrl() {
  const normalizedEnvUrl = String(ENV_VALIDATION_SERVICE_URL || '').trim();
  if (shouldIgnoreEnvUrl(normalizedEnvUrl)) {
    return DEFAULT_VALIDATION_SERVICE_URL;
  }
  return normalizedEnvUrl;
}

const API_GATEWAY_URL = resolveGatewayUrl();
const USER_SERVICE_URL = resolveUserServiceUrl();
const NOTIFICATIONS_SERVICE_URL = resolveNotificationsServiceUrl();
const CARD_SERVICE_URL = resolveCardServiceUrl();
const NEWS_SERVICE_URL = resolveNewsServiceUrl();
const VALIDATION_SERVICE_URL = resolveValidationServiceUrl();

let authTokenCache = null;
let refreshTokenCache = null;

function getStorage() {
  try {
    return typeof globalThis !== 'undefined' ? globalThis.localStorage : null;
  } catch {
    return null;
  }
}

function readStorage(key) {
  const storage = getStorage();
  if (!storage) return null;

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  const storage = getStorage();
  if (!storage) return;

  try {
    if (value === null || value === undefined) {
      storage.removeItem(key);
      return;
    }
    storage.setItem(key, String(value));
  } catch {}
}

function removeStorage(key) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(key);
  } catch {}
}

// Token handling here to avoid circular imports.
export function saveToken(token, refreshToken) {
  authTokenCache = token || null;
  if (refreshToken !== undefined) {
    refreshTokenCache = refreshToken || null;
  }

  writeStorage('authToken', token);
  if (refreshToken !== undefined) {
    writeStorage('refreshToken', refreshToken);
  }
}

export function getToken() {
  if (authTokenCache) return authTokenCache;
  authTokenCache = readStorage('authToken');
  return authTokenCache;
}

export function clearToken() {
  authTokenCache = null;
  refreshTokenCache = null;
  removeStorage('authToken');
  removeStorage('refreshToken');
}

export function getRefreshToken() {
  if (refreshTokenCache) return refreshTokenCache;
  refreshTokenCache = readStorage('refreshToken');
  return refreshTokenCache;
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

export async function validationServiceRequest(path, options = {}) {
  return baseRequest(VALIDATION_SERVICE_URL, path, options);
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
    ...(headers || {}),
    ...(hasBody && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response = await fetch(url, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  if (response.status === 401 && !skipAuth && path !== '/auth/refresh-token') {
    const nextToken = await refreshAuthToken();
    if (nextToken) {
      response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...requestHeaders,
          Authorization: `Bearer ${nextToken}`,
        },
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

/** Routes /uploads/* live in user-service (also exposed via Kong). */
export function resolveImageUrl(url) {
  if (!url) return null;

  const value = String(url).trim();
  if (!value) return null;

  const uploadsBase = USER_SERVICE_URL.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
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
  VALIDATION_SERVICE_URL,
};
