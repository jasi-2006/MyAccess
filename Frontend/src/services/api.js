import { Platform } from 'react-native';

const DEFAULT_GATEWAY_URL = 'https://myaccess-gateway.onrender.com';
const API_GATEWAY_URL =
  process.env.EXPO_PUBLIC_API_GATEWAY_URL ||
  Platform.select({
    android: DEFAULT_GATEWAY_URL,
    web: DEFAULT_GATEWAY_URL,
    default: DEFAULT_GATEWAY_URL,
  });

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
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_GATEWAY_URL}${path}`, {
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await parsePayload(response);

  if (!response.ok) {
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

export { API_GATEWAY_URL };
