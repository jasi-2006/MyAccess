import { Platform } from 'react-native';

const DEFAULT_GATEWAY_URL = 'https://myaccess-kong.onrender.com';
const DEFAULT_USER_SERVICE_URL = 'https://myaccess-user.onrender.com';
const ENV_GATEWAY_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL;
const ENV_USER_SERVICE_URL = process.env.EXPO_PUBLIC_USER_SERVICE_URL;

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

const API_GATEWAY_URL =
  resolveGatewayUrl() ||
  Platform.select({
    android: DEFAULT_GATEWAY_URL,
    web: DEFAULT_GATEWAY_URL,
    default: DEFAULT_GATEWAY_URL,
  });

const USER_SERVICE_URL = resolveUserServiceUrl();

// Manejo del token aquí para evitar importación circular
export function saveToken(token) {
  try { localStorage.setItem('authToken', token); } catch {}
}

export function getToken() {
  try { return localStorage.getItem('authToken'); } catch { return null; }
}

export function clearToken() {
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

async function baseRequest(baseUrl, path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const { skipAuth = false, headers, ...fetchOptions } = options;
  const url = `${baseUrl}${path}`;
  const method = fetchOptions.method || 'GET';
  const hasBody = fetchOptions.body !== undefined && fetchOptions.body !== null;
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
      payload,
    });
    if (response.status === 401) {
      clearToken();
    }
    const error = new Error(getErrorMessage(payload));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export { API_GATEWAY_URL, USER_SERVICE_URL };
