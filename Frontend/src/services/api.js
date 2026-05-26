import { Platform } from 'react-native';

const DEFAULT_GATEWAY_URL = 'https://myaccess-kong.onrender.com';
const DEFAULT_USER_SERVICE_URL = 'https://myaccess-user.onrender.com';
const DEFAULT_NOTIFICATIONS_SERVICE_URL = 'https://myaccess-notification-1cxp.onrender.com';
const DEFAULT_CARD_SERVICE_URL = 'https://myaccess-card-4tuh.onrender.com';
const DEFAULT_NEWS_SERVICE_URL = 'https://myaccess-news-ft80.onrender.com';
const ENV_GATEWAY_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL;
const ENV_USER_SERVICE_URL = process.env.EXPO_PUBLIC_USER_SERVICE_URL;
const ENV_NOTIFICATIONS_SERVICE_URL = process.env.EXPO_PUBLIC_NOTIFICATIONS_SERVICE_URL;
const ENV_CARD_SERVICE_URL = process.env.EXPO_PUBLIC_CARD_SERVICE_URL;
const ENV_NEWS_SERVICE_URL = process.env.EXPO_PUBLIC_NEWS_SERVICE_URL;

function resolveGatewayUrl() {
  const normalizedEnvUrl = String(ENV_GATEWAY_URL || '').trim();

  if (!normalizedEnvUrl) {
    return DEFAULT_GATEWAY_URL;
  }

  // Ignore the deprecated Render gateway if it is still configured in Vercel.
  if (normalizedEnvUrl.includes('myaccess-8dfq.onrender.com')) {
    return DEFAULT_GATEWAY_URL;
  }

  return normalizedEnvUrl;
}

function resolveUserServiceUrl() {
  const normalizedEnvUrl = String(ENV_USER_SERVICE_URL || '').trim();
  return normalizedEnvUrl || DEFAULT_USER_SERVICE_URL;
}

function resolveNotificationsServiceUrl() {
  const normalizedEnvUrl = String(ENV_NOTIFICATIONS_SERVICE_URL || '').trim();
  return normalizedEnvUrl || DEFAULT_NOTIFICATIONS_SERVICE_URL;
}

function resolveCardServiceUrl() {
  const normalizedEnvUrl = String(ENV_CARD_SERVICE_URL || '').trim();
  return normalizedEnvUrl || DEFAULT_CARD_SERVICE_URL;
}

function resolveNewsServiceUrl() {
  const normalizedEnvUrl = String(ENV_NEWS_SERVICE_URL || '').trim();
  return normalizedEnvUrl || DEFAULT_NEWS_SERVICE_URL;
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

// Manejo del token aquí para evitar importación circular
export function saveToken(token) {
  authTokenCache = token || null;
  try { localStorage.setItem('authToken', token); } catch {}
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
  try { localStorage.removeItem('authToken'); } catch {}
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

export async function apiRequest(path, options = {}) {
  return baseRequest(API_GATEWAY_URL, path, options);
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

  const response = await fetch(url, {
    headers: {
      ...(hasBody && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    ...fetchOptions,
  });

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

export {
  API_GATEWAY_URL,
  USER_SERVICE_URL,
  NOTIFICATIONS_SERVICE_URL,
  CARD_SERVICE_URL,
  NEWS_SERVICE_URL,
};
