import { apiRequest } from './api';

let authToken = null;

export function getAuthToken() {
  return authToken;
}

export async function loginUser(credentials) {
  const response = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  authToken = response?.token ?? null;
  return response;
}

export async function registerUser(payload) {
  return apiRequest('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyUser(email, code) {
  const query = `email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`;

  return apiRequest(`/api/v1/auth/verify?${query}`, {
    method: 'POST',
  });
}
