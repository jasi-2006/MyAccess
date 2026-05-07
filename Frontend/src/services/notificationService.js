import { apiRequest } from './api';

const NOTIFICATIONS_PATH = '/api/v1/notificationsService/notifications';

export async function getNotifications() {
  return apiRequest(NOTIFICATIONS_PATH);
}

export async function getNotificationsByUser(idUser) {
  return apiRequest(`${NOTIFICATIONS_PATH}/user/${encodeURIComponent(idUser)}`);
}

export async function getNotificationsByState(statedSend) {
  return apiRequest(`${NOTIFICATIONS_PATH}/state/${encodeURIComponent(statedSend)}`);
}

export async function createNotification(payload) {
  return apiRequest(NOTIFICATIONS_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateNotification(idNotification, payload) {
  return apiRequest(`${NOTIFICATIONS_PATH}/${encodeURIComponent(idNotification)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function markNotificationAsRead(idNotification) {
  return apiRequest(`${NOTIFICATIONS_PATH}/${encodeURIComponent(idNotification)}/read`, {
    method: 'PUT',
  });
}

export function countUnreadNotifications(notifications) {
  return Array.isArray(notifications)
    ? notifications.filter((item) => !item.readingDate).length
    : 0;
}
