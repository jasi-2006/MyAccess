package com.proyect.MyAccess.notifications_service.service;

import com.proyect.MyAccess.notifications_service.dto.NotificationRequestDTO;
import com.proyect.MyAccess.notifications_service.dto.NotificationResponseDTO;
import com.proyect.MyAccess.notifications_service.entity.Config;
import com.proyect.MyAccess.notifications_service.entity.Notification;
import com.proyect.MyAccess.notifications_service.repository.ConfigRepository;
import com.proyect.MyAccess.notifications_service.repository.NotificationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/*
 * Servicio para gestionar las notificaciones del sistema.
 * Permite crear, consultar y actualizar notificaciones enviadas a los usuarios.
 */
@RequiredArgsConstructor
@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ConfigRepository configRepository;

    /*
     * Crea y persiste una nueva notificación. Asigna la fecha de creación automáticamente.
     * @param dto Datos de la notificación a crear, incluyendo idConfig opcional
     * @return NotificationResponseDTO con los datos de la notificación creada
     */
    public NotificationResponseDTO create(NotificationRequestDTO dto) {
        Config config = resolveConfig(dto.getIdConfig());
        Notification notification = new Notification();
        applyUpdate(notification, dto, config);
        notification.setCreatedDate(LocalDateTime.now());
        notificationRepository.save(notification);
        return toResponse(notification);
    }

    /*
     * Retorna todas las notificaciones registradas en el sistema.
     * @return Lista de NotificationResponseDTO con todas las notificaciones
     */
    public List<NotificationResponseDTO> getAll() {
        List<NotificationResponseDTO> list = new ArrayList<>();
        for (Notification notification : notificationRepository.findAll()) {
            list.add(toResponse(notification));
        }
        return list;
    }

    /*
     * Retorna todas las notificaciones asociadas a un usuario específico.
     * @param idUser Identificador del usuario
     * @return Lista de NotificationResponseDTO con las notificaciones del usuario
     */
    public List<NotificationResponseDTO> getByUser(Integer idUser) {
        List<NotificationResponseDTO> list = new ArrayList<>();
        for (Notification notification : notificationRepository.findByIdUser(idUser)) {
            list.add(toResponse(notification));
        }
        return list;
    }

    /*
     * Filtra las notificaciones por su estado de envío.
     * @param statedSend Estado de envío a filtrar
     * @return Lista de NotificationResponseDTO con las notificaciones en ese estado
     */
    public List<NotificationResponseDTO> getByState(String statedSend) {
        List<NotificationResponseDTO> list = new ArrayList<>();
        for (Notification notification : notificationRepository.findByStatedSend(statedSend)) {
            list.add(toResponse(notification));
        }
        return list;
    }

    /*
     * Actualiza los datos de una notificación existente por su ID.
     * Si se proporciona idConfig, actualiza también la configuración asociada.
     * @param id Identificador de la notificación a actualizar
     * @param dto Nuevos datos de la notificación
     * @return Optional con el NotificationResponseDTO actualizado, vacío si no existe
     */
    public Optional<NotificationResponseDTO> update(Long id, NotificationRequestDTO dto) {
        return notificationRepository.findById(id).map(notification -> {
            Config config = dto.getIdConfig() != null ? resolveConfig(dto.getIdConfig()) : notification.getConfig();
            applyUpdate(notification, dto, config);
            return toResponse(notificationRepository.save(notification));
        });
    }

    public Optional<NotificationResponseDTO> markAsRead(Long id, Long userId, String role) {
        return notificationRepository.findById(id).map(notification -> {
            if ("APRENDIZ".equalsIgnoreCase(role)
                    && (notification.getIdUser() == null || !userId.equals(notification.getIdUser().longValue()))) {
                throw new RuntimeException("No tienes permiso para leer esta notificacion");
            }
            if (notification.getReadingDate() == null) {
                notification.setReadingDate(LocalDateTime.now());
            }
            return toResponse(notificationRepository.save(notification));
        });
    }

    /*
     * Busca una configuración por su ID. Lanza excepción si no existe.
     * @param idConfig Identificador de la configuración
     * @return Entidad Config encontrada, o null si idConfig es null
     */
    private Config resolveConfig(Long idConfig) {
        if (idConfig == null) return null;
        return configRepository.findById(idConfig)
                .orElseThrow(() -> new RuntimeException("Configuración no encontrada"));
    }

    /*
     * Aplica los datos del DTO sobre una entidad Notification (usado en create y update).
     * @param notification Entidad Notification a modificar
     * @param dto Datos a aplicar
     * @param config Configuración asociada a la notificación
     */
    private void applyUpdate(Notification notification, NotificationRequestDTO dto, Config config) {
        notification.setIdUser(dto.getIdUser());
        notification.setTipe(dto.getTipe());
        notification.setCategory(dto.getCategory());
        notification.setAffair(dto.getAffair());
        notification.setMessaje(dto.getMessaje());
        notification.setStatedSend(dto.getStatedSend());
        notification.setConfig(config);
    }

    /*
     * Convierte una entidad Notification en su DTO de respuesta.
     * @param notification Entidad de notificación a convertir
     * @return NotificationResponseDTO con los datos mapeados
     */
    private NotificationResponseDTO toResponse(Notification notification) {
        NotificationResponseDTO r = new NotificationResponseDTO();
        r.setIdNotifications(notification.getIdNotifications());
        r.setIdUser(notification.getIdUser());
        r.setTipe(notification.getTipe());
        r.setCategory(notification.getCategory());
        r.setAffair(notification.getAffair());
        r.setMessaje(notification.getMessaje());
        r.setStatedSend(notification.getStatedSend());
        r.setSendDate(notification.getSendDate());
        r.setReadingDate(notification.getReadingDate());
        r.setCreatedDate(notification.getCreatedDate());
        r.setIdConfig(notification.getConfig() != null ? notification.getConfig().getIdConfig() : null);
        return r;
    }
}
