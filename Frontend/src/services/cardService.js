import { cardServiceRequest } from './api';

export async function getCardsByUser(idUser) {
  return cardServiceRequest(`/cardService/cards/user/${encodeURIComponent(idUser)}`);
}

export async function getAllCards() {
  return cardServiceRequest('/cardService/cards');
}

export async function createCard(payload) {
  return cardServiceRequest('/cardService/cards', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCardActiveState(idCard, active) {
  const activeValue = active ? 'true' : 'false';

  try {
    return await cardServiceRequest(`/cardService/cards/${encodeURIComponent(idCard)}/active?active=${activeValue}`, {
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
  return cardServiceRequest(`/cardService/cards/${encodeURIComponent(idCard)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
