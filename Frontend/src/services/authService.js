import { apiRequest, saveToken, getToken, clearToken } from './api';

export function getAuthToken() {
  return getToken();
}

export async function loginUser(credentials) {
  const response = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  if (response?.token) saveToken(response.token);
  return response;
}

export async function logoutUser() {
  clearToken();
}

export async function getUserProfile() {
  if (!getToken()) return null;
  return apiRequest('/api/v1/register/profile/me');
}

export async function registerUser(payload) {
  const isFormData = payload instanceof FormData;
  return apiRequest('/api/v1/auth/register', {
    method: 'POST',
    body: isFormData ? payload : JSON.stringify(payload),
  });
}

export async function uploadPhoto(document, formData) {
  return apiRequest(`/api/v1/auth/photo/${encodeURIComponent(document)}`, {
    method: 'POST',
    body: formData,
  });
}

export async function verifyUser(email, code) {
  const query = `email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`;
  return apiRequest(`/api/v1/auth/verify?${query}`, { method: 'POST' });
}

export async function forgotPassword(email) {
  return apiRequest(`/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`, { method: 'POST' });
}

export async function resetPassword(email, code, newPassword) {
  return apiRequest('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword }),
  });
}

export async function resendVerificationCode(email) {
  return apiRequest(`/api/v1/auth/resend?email=${encodeURIComponent(email.trim().toLowerCase())}`, { method: 'POST' });
}

export async function requestPasswordResetCode(email) {
  return apiRequest(`/api/v1/auth/forgot-password?email=${encodeURIComponent(String(email).trim().toLowerCase())}`, { method: 'POST' });
}

export async function updateUserProfile(document, dto) {
  return apiRequest(`/api/v1/register/users/document/${encodeURIComponent(document)}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export async function updatePasswordWithCode(email, code, newPassword) {
  return apiRequest('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      email: String(email).trim().toLowerCase(),
      code: String(code).trim(),
      newPassword: String(newPassword),
    }),
  });
}
