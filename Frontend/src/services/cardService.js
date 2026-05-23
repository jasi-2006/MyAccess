import { apiRequest } from './api';

export async function getCardsByUser(idUser) {
  return apiRequest(`/api/v1/cardService/cards/user/${encodeURIComponent(idUser)}`);
}

export async function getAllCards() {
  return apiRequest('/api/v1/cardService/cards');
}

export async function createCard(payload) {
  return apiRequest('/api/v1/cardService/cards', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCardActiveState(idCard, active) {
  const activeValue = active ? 'true' : 'false';

  try {
    return await apiRequest(`/api/v1/cardService/cards/${encodeURIComponent(idCard)}/active?active=${activeValue}`, {
      method: 'PATCH',
    });
  } catch (error) {
    if (error.status !== 404 && error.status !== 405) {
      throw error;
    }

    return updateCard(idCard, {
      active,
      digitalState: active ? 'activo' : 'inactivo',
    });
  }
}

export async function updateCard(idCard, payload) {
  return apiRequest(`/api/v1/cardService/cards/${encodeURIComponent(idCard)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
