package com.proyect.notifications_service.service;

import com.proyect.notifications_service.dto.QueueNotificationRequestDTO;
import com.proyect.notifications_service.dto.QueueNotificationResponseDTO;
import com.proyect.notifications_service.entity.Notification;
import com.proyect.notifications_service.entity.QueueNotification;
import com.proyect.notifications_service.repository.NotificationRepository;
import com.proyect.notifications_service.repository.QueueNotificationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/*
 * Servicio para gestionar la cola de envío de notificaciones.
 * Permite encolar, consultar y eliminar notificaciones pendientes de envío.
 */
@RequiredArgsConstructor
@Service
@Transactional
public class QueueNotificationService {

    private final QueueNotificationRepository queueRepository;
    private final NotificationRepository notificationRepository;

    /*
     * Agrega una notificación a la cola de envío.
     * @param dto Datos del elemento de cola, incluyendo idNotifications opcional
     * @return QueueNotificationResponseDTO con los datos del elemento creado
     */
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
        return toResponse(queue);
    }

    /*
     * Retorna toda la cola ordenada por prioridad ascendente.
     * @return Lista de QueueNotificationResponseDTO ordenada por prioridad
     */
    public List<QueueNotificationResponseDTO> getAll() {
        List<QueueNotificationResponseDTO> list = new ArrayList<>();
        for (QueueNotification queue : queueRepository.findByOrderByPriorityAsc()) {
            list.add(toResponse(queue));
        }
        return list;
    }

    /*
     * Filtra los elementos de la cola por canal de envío.
     * @param chanel Canal de envío a filtrar (ej: EMAIL, SMS)
     * @return Lista de QueueNotificationResponseDTO con los elementos del canal indicado
     */
    public List<QueueNotificationResponseDTO> getByChanel(String chanel) {
        List<QueueNotificationResponseDTO> list = new ArrayList<>();
        for (QueueNotification queue : queueRepository.findByChanel(chanel)) {
            list.add(toResponse(queue));
        }
        return list;
    }

    /*
     * Elimina un elemento de la cola por su ID.
     * @param id Identificador del elemento a eliminar
     * @return true si fue eliminado, false si no existía
     */
    public boolean delete(Long id) {
        if (queueRepository.existsById(id)) {
            queueRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /*
     * Convierte una entidad QueueNotification en su DTO de respuesta.
     * @param queue Entidad de cola a convertir
     * @return QueueNotificationResponseDTO con los datos mapeados
     */
    private QueueNotificationResponseDTO toResponse(QueueNotification queue) {
        QueueNotificationResponseDTO r = new QueueNotificationResponseDTO();
        r.setIdQueue(queue.getIdQueue());
        r.setIdNotifications(queue.getNotification() != null ? queue.getNotification().getIdNotifications() : null);
        r.setPriority(queue.getPriority());
        r.setChanel(queue.getChanel());
        return r;
    }
}
