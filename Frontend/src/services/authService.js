import { apiRequest, userServiceRequest, saveToken, getToken, clearToken } from './api';

export function getAuthToken() {
  return getToken();
}

export async function loginUser(credentials) {
  const response = await userServiceRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    skipAuth: true,
  });
  const token = response?.token || response?.accessToken || response?.data?.token || response?.data?.accessToken;
  const refreshToken = response?.refreshToken || response?.data?.refreshToken;
  if (token) saveToken(token, refreshToken);
  return response;
}

export async function logoutUser() {
  clearToken();
}

export async function getUserProfile() {
  if (!getToken()) return null;
  return userServiceRequest('/register/profile/me');
}

export async function getAllUserProfiles() {
  // Backend expone GET /register (UserRegisterProfileController.getAll).
  return userServiceRequest('/register');
}

export async function registerUser(payload) {
  const isFormData = payload instanceof FormData;
  return userServiceRequest('/auth/register', {
    method: 'POST',
    body: isFormData ? payload : JSON.stringify(payload),
    skipAuth: true,
  });
}

export async function uploadPhoto(document, formData) {
  return userServiceRequest(`/auth/photo/${encodeURIComponent(document)}`, {
    method: 'POST',
    body: formData,
    skipAuth: true,
  });
}

/** Actualizar foto con sesión iniciada (perfil / edición). */
export async function uploadProfilePhoto(document, formData) {
  return userServiceRequest(`/register/users/photo/${encodeURIComponent(document)}`, {
    method: 'POST',
    body: formData,
  });
}

export async function verifyUser(email, code) {
  const query = `email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`;
  return userServiceRequest(`/auth/verify?${query}`, { method: 'POST', skipAuth: true });
}

export async function forgotPassword(email) {
  return userServiceRequest(`/auth/forgot-password?email=${encodeURIComponent(email)}`, { method: 'POST', skipAuth: true });
}

export async function resetPassword(email, code, newPassword) {
  return userServiceRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword }),
    skipAuth: true,
  });
}

export async function resendVerificationCode(email) {
  return userServiceRequest(`/auth/resend?email=${encodeURIComponent(email.trim().toLowerCase())}`, { method: 'POST', skipAuth: true });
}

export async function requestPasswordResetCode(email) {
  return userServiceRequest(`/auth/forgot-password?email=${encodeURIComponent(String(email).trim().toLowerCase())}`, { method: 'POST', skipAuth: true });
}

export async function updateUserProfile(document, dto) {
  return userServiceRequest(`/register/users/document/${encodeURIComponent(document)}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export async function updatePasswordWithCode(email, code, newPassword) {
  return userServiceRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      email: String(email).trim().toLowerCase(),
      code: String(code).trim(),
      newPassword: String(newPassword),
    }),
    skipAuth: true,
  });
}
