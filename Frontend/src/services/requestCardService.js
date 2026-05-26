import { cardServiceRequest } from './api';

export async function getRequestCardsByState(state) {
  return cardServiceRequest(`/cardService/requests/state/${encodeURIComponent(state)}`);
}

export async function getAllRequestCards() {
  return cardServiceRequest('/cardService/requests');
}

export async function getRequestCardsByUser(idUser) {
  return cardServiceRequest(`/cardService/requests/user/${encodeURIComponent(idUser)}`);
}

export async function createRequestCard(payload) {
  return cardServiceRequest('/cardService/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateRequestCard(idRequest, payload) {
  return cardServiceRequest(`/cardService/requests/${encodeURIComponent(idRequest)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
