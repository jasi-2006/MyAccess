import { apiRequest } from './api';

export async function getRequestCardsByState(state) {
  return apiRequest(`/api/v1/cardService/requests/state/${encodeURIComponent(state)}`);
}

export async function getAllRequestCards() {
  return apiRequest('/api/v1/cardService/requests');
}

export async function getRequestCardsByUser(idUser) {
  return apiRequest(`/api/v1/cardService/requests/user/${encodeURIComponent(idUser)}`);
}

export async function createRequestCard(payload) {
  return apiRequest('/api/v1/cardService/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateRequestCard(idRequest, payload) {
  return apiRequest(`/api/v1/cardService/requests/${encodeURIComponent(idRequest)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
