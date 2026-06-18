import { userServiceRequest } from './api';

/**
 * Envía una solicitud de validación con Sofia Plus al microservicio del backend.
 * @param {string} document Número de documento del aprendiz
 * @param {string} password Contraseña de Sofia Plus
 * @param {boolean} useMock Indica si se debe ejecutar en Modo Demo (sin credenciales reales)
 */
export async function verifySofiaPlus(document, password, useMock = false) {
  return userServiceRequest(`/register/users/document/${encodeURIComponent(document)}/verify-sofia`, {
    method: 'POST',
    body: JSON.stringify({ password, useMock }),
  });
}

/**
 * Actualiza manualmente el estado de verificación de Sofia Plus para el aprendiz.
 * @param {string} document Número de documento del aprendiz
 * @param {boolean} verified true si está verificado, false de lo contrario
 */
export async function updateSofiaVerified(document, verified) {
  const query = `verified=${encodeURIComponent(verified)}`;
  return userServiceRequest(`/register/users/document/${encodeURIComponent(document)}/sofia-verified?${query}`, {
    method: 'PUT',
  });
}
