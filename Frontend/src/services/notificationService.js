import { notificationsServiceRequest } from './api';

const NOTIFICATIONS_PATH = '/notificationsService/notifications';

export async function getNotifications(filter = '') {
  const query = String(filter || '').trim();
  const path = query
    ? `${NOTIFICATIONS_PATH}?filter=${encodeURIComponent(query)}`
    : NOTIFICATIONS_PATH;
  return notificationsServiceRequest(path);
}

export async function getNotificationsByUser(idUser) {
  return notificationsServiceRequest(`${NOTIFICATIONS_PATH}/user/${encodeURIComponent(idUser)}`);
}

export async function getNotificationsByState(statedSend) {
  return notificationsServiceRequest(`${NOTIFICATIONS_PATH}/state/${encodeURIComponent(statedSend)}`);
}

export async function createNotification(payload) {
  return notificationsServiceRequest(NOTIFICATIONS_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateNotification(idNotification, payload) {
  return notificationsServiceRequest(`${NOTIFICATIONS_PATH}/${encodeURIComponent(idNotification)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function markNotificationAsRead(idNotification) {
  return notificationsServiceRequest(`${NOTIFICATIONS_PATH}/${encodeURIComponent(idNotification)}/read`, {
    method: 'PUT',
  });
}

export function countUnreadNotifications(notifications) {
  return Array.isArray(notifications)
    ? notifications.filter((item) => !item.readingDate).length
    : 0;
}
