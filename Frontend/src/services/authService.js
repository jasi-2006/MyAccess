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

export async function forgotPassword(email) {
  return apiRequest(`/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`, {
    method: 'POST',
  });
}

export async function resetPassword(email, code, newPassword) {
  return apiRequest('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword }),
  });
}

export async function resendVerificationCode(email, registerPayload = null) {
  const normalizedEmail = email.trim().toLowerCase();
  const query = `email=${encodeURIComponent(normalizedEmail)}`;
  const resendAttempts = [
    `/api/v1/auth/resend-verification?${query}`,
    `/api/v1/auth/verify/resend?${query}`,
    `/api/v1/auth/resend?${query}`,
  ];

  let lastError = null;

  for (const path of resendAttempts) {
    try {
      return await apiRequest(path, {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail }),
      });
    } catch (error) {
      lastError = error;

      if (error?.status !== 404 && error?.status !== 405) {
        throw error;
      }
    }
  }

  if (registerPayload) {
    return registerUser(registerPayload);
  }

  throw lastError || new Error('No fue posible reenviar el codigo de verificacion.');
}

export async function requestPasswordResetCode(email) {
  const normalizedEmail = String(email).trim().toLowerCase();
  return apiRequest(`/api/v1/auth/forgot-password?email=${encodeURIComponent(normalizedEmail)}`, {
    method: 'POST',
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
