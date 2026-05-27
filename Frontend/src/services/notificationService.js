import { apiRequest, notificationsServiceRequest } from './api';

const NOTIFICATIONS_KONG_PATH = '/api/v1/notificationsService/notifications';

async function requestNotifications(path, options = {}) {
  try {
    return await apiRequest(path, options);
  } catch (error) {
    if (error?.status !== 500) {
      throw error;
    }
    const directPath = path.replace(
      '/api/v1/notificationsService',
      '/notificationsService',
    );
    return notificationsServiceRequest(directPath, options);
  }
}

export async function getNotifications(filter = '') {
  const query = String(filter || '').trim();
  const path = query
    ? `${NOTIFICATIONS_KONG_PATH}?filter=${encodeURIComponent(query)}`
    : NOTIFICATIONS_KONG_PATH;
  return requestNotifications(path);
}

export async function getNotificationsByUser(idUser) {
  return requestNotifications(
    `${NOTIFICATIONS_KONG_PATH}/user/${encodeURIComponent(idUser)}`,
  );
}

export async function getNotificationsByState(statedSend) {
  return requestNotifications(
    `${NOTIFICATIONS_KONG_PATH}/state/${encodeURIComponent(statedSend)}`,
  );
}

export async function createNotification(payload) {
  return requestNotifications(NOTIFICATIONS_KONG_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateNotification(idNotification, payload) {
  return requestNotifications(
    `${NOTIFICATIONS_KONG_PATH}/${encodeURIComponent(idNotification)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
}

export async function markNotificationAsRead(idNotification) {
  return requestNotifications(
    `${NOTIFICATIONS_KONG_PATH}/${encodeURIComponent(idNotification)}/read`,
    {
      method: 'PUT',
    },
  );
}

export function countUnreadNotifications(notifications) {
  return Array.isArray(notifications)
    ? notifications.filter((item) => !item.readingDate).length
    : 0;
}
