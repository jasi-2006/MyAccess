package com.proyect.MyAccess.notifications_service.service;

import com.proyect.MyAccess.notifications_service.dto.QueueNotificationRequestDTO;
import com.proyect.MyAccess.notifications_service.dto.QueueNotificationResponseDTO;
import com.proyect.MyAccess.notifications_service.entity.Notification;
import com.proyect.MyAccess.notifications_service.entity.QueueNotification;
import com.proyect.MyAccess.notifications_service.repository.NotificationRepository;
import com.proyect.MyAccess.notifications_service.repository.QueueNotificationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
@Transactional
public class QueueNotificationService {

    private final QueueNotificationRepository queueRepository;
    private final NotificationRepository notificationRepository;

    public QueueNotificationResponseDTO create(QueueNotificationRequestDTO dto) {
        Notification notification = null;
        if (dto.getIdNotifications() != null) {
            notification = notificationRepository.findById(dto.getIdNotifications())
                    .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        }

        QueueNotification queue = new QueueNotification();
        queue.setPriority(dto.getPriority());
        queue.setChanel(dto.getChanel());
        queue.setNotification(notification);

        queueRepository.save(queue);

        QueueNotificationResponseDTO response = new QueueNotificationResponseDTO();
        response.setIdQueue(queue.getIdQueue());
        response.setIdNotifications(notification != null ? notification.getIdNotifications() : null);
        response.setPriority(queue.getPriority());
        response.setChanel(queue.getChanel());

        return response;
    }

    public List<QueueNotificationResponseDTO> getAll() {
        List<QueueNotification> queues = queueRepository.findByOrderByPriorityAsc();
        List<QueueNotificationResponseDTO> list = new ArrayList<>();

        for (QueueNotification queue : queues) {
            QueueNotificationResponseDTO response = new QueueNotificationResponseDTO();
            response.setIdQueue(queue.getIdQueue());
            response.setIdNotifications(queue.getNotification() != null ? queue.getNotification().getIdNotifications() : null);
            response.setPriority(queue.getPriority());
            response.setChanel(queue.getChanel());
            list.add(response);
        }
        return list;
    }

    public List<QueueNotificationResponseDTO> getByChanel(String chanel) {
        List<QueueNotification> queues = queueRepository.findByChanel(chanel);
        List<QueueNotificationResponseDTO> list = new ArrayList<>();

        for (QueueNotification queue : queues) {
            QueueNotificationResponseDTO response = new QueueNotificationResponseDTO();
            response.setIdQueue(queue.getIdQueue());
            response.setIdNotifications(queue.getNotification() != null ? queue.getNotification().getIdNotifications() : null);
            response.setPriority(queue.getPriority());
            response.setChanel(queue.getChanel());
            list.add(response);
        }
        return list;
    }

    public boolean delete(Long id) {
        if (queueRepository.existsById(id)) {
            queueRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
