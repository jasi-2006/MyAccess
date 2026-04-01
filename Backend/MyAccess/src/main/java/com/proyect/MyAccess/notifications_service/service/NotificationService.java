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

@RequiredArgsConstructor
@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ConfigRepository configRepository;

    public NotificationResponseDTO create(NotificationRequestDTO dto) {
        Config config = null;
        if (dto.getIdConfig() != null) {
            config = configRepository.findById(dto.getIdConfig())
                    .orElseThrow(() -> new RuntimeException("Configuración no encontrada"));
        }

        Notification notification = new Notification();
        notification.setIdUser(dto.getIdUser());
        notification.setTipe(dto.getTipe());
        notification.setCategory(dto.getCategory());
        notification.setAffair(dto.getAffair());
        notification.setMessaje(dto.getMessaje());
        notification.setStatedSend(dto.getStatedSend());
        notification.setCreatedDate(LocalDateTime.now());
        notification.setConfig(config);

        notificationRepository.save(notification);

        NotificationResponseDTO response = new NotificationResponseDTO();
        response.setIdNotifications(notification.getIdNotifications());
        response.setIdUser(notification.getIdUser());
        response.setTipe(notification.getTipe());
        response.setCategory(notification.getCategory());
        response.setAffair(notification.getAffair());
        response.setMessaje(notification.getMessaje());
        response.setStatedSend(notification.getStatedSend());
        response.setSendDate(notification.getSendDate());
        response.setReadingDate(notification.getReadingDate());
        response.setCreatedDate(notification.getCreatedDate());
        response.setIdConfig(config != null ? config.getIdConfig() : null);

        return response;
    }

    public List<NotificationResponseDTO> getAll() {
        List<Notification> notifications = notificationRepository.findAll();
        List<NotificationResponseDTO> list = new ArrayList<>();

        for (Notification notification : notifications) {
            NotificationResponseDTO response = new NotificationResponseDTO();
            response.setIdNotifications(notification.getIdNotifications());
            response.setIdUser(notification.getIdUser());
            response.setTipe(notification.getTipe());
            response.setCategory(notification.getCategory());
            response.setAffair(notification.getAffair());
            response.setMessaje(notification.getMessaje());
            response.setStatedSend(notification.getStatedSend());
            response.setSendDate(notification.getSendDate());
            response.setReadingDate(notification.getReadingDate());
            response.setCreatedDate(notification.getCreatedDate());
            response.setIdConfig(notification.getConfig() != null ? notification.getConfig().getIdConfig() : null);
            list.add(response);
        }
        return list;
    }

    public List<NotificationResponseDTO> getByUser(Integer idUser) {
        List<Notification> notifications = notificationRepository.findByIdUser(idUser);
        List<NotificationResponseDTO> list = new ArrayList<>();

        for (Notification notification : notifications) {
            NotificationResponseDTO response = new NotificationResponseDTO();
            response.setIdNotifications(notification.getIdNotifications());
            response.setIdUser(notification.getIdUser());
            response.setTipe(notification.getTipe());
            response.setCategory(notification.getCategory());
            response.setAffair(notification.getAffair());
            response.setMessaje(notification.getMessaje());
            response.setStatedSend(notification.getStatedSend());
            response.setSendDate(notification.getSendDate());
            response.setReadingDate(notification.getReadingDate());
            response.setCreatedDate(notification.getCreatedDate());
            response.setIdConfig(notification.getConfig() != null ? notification.getConfig().getIdConfig() : null);
            list.add(response);
        }
        return list;
    }

    public List<NotificationResponseDTO> getByState(String statedSend) {
        List<Notification> notifications = notificationRepository.findByStatedSend(statedSend);
        List<NotificationResponseDTO> list = new ArrayList<>();

        for (Notification notification : notifications) {
            NotificationResponseDTO response = new NotificationResponseDTO();
            response.setIdNotifications(notification.getIdNotifications());
            response.setIdUser(notification.getIdUser());
            response.setTipe(notification.getTipe());
            response.setCategory(notification.getCategory());
            response.setAffair(notification.getAffair());
            response.setMessaje(notification.getMessaje());
            response.setStatedSend(notification.getStatedSend());
            response.setSendDate(notification.getSendDate());
            response.setReadingDate(notification.getReadingDate());
            response.setCreatedDate(notification.getCreatedDate());
            response.setIdConfig(notification.getConfig() != null ? notification.getConfig().getIdConfig() : null);
            list.add(response);
        }
        return list;
    }

    public Optional<NotificationResponseDTO> update(Long id, NotificationRequestDTO dto) {
        Optional<Notification> optionalNotification = notificationRepository.findById(id);

        if (optionalNotification.isPresent()) {
            Notification notification = optionalNotification.get();
            notification.setIdUser(dto.getIdUser());
            notification.setTipe(dto.getTipe());
            notification.setCategory(dto.getCategory());
            notification.setAffair(dto.getAffair());
            notification.setMessaje(dto.getMessaje());
            notification.setStatedSend(dto.getStatedSend());

            if (dto.getIdConfig() != null) {
                Config config = configRepository.findById(dto.getIdConfig())
                        .orElseThrow(() -> new RuntimeException("Configuración no encontrada"));
                notification.setConfig(config);
            }

            Notification updated = notificationRepository.save(notification);

            NotificationResponseDTO response = new NotificationResponseDTO();
            response.setIdNotifications(updated.getIdNotifications());
            response.setIdUser(updated.getIdUser());
            response.setTipe(updated.getTipe());
            response.setCategory(updated.getCategory());
            response.setAffair(updated.getAffair());
            response.setMessaje(updated.getMessaje());
            response.setStatedSend(updated.getStatedSend());
            response.setSendDate(updated.getSendDate());
            response.setReadingDate(updated.getReadingDate());
            response.setCreatedDate(updated.getCreatedDate());
            response.setIdConfig(updated.getConfig() != null ? updated.getConfig().getIdConfig() : null);

            return Optional.of(response);
        } else {
            return Optional.empty();
        }
    }
}
