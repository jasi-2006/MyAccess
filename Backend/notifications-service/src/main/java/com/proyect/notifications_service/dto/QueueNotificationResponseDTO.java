package com.proyect.notifications_service.dto;

import lombok.Data;

@Data
public class QueueNotificationResponseDTO {
    private Long idQueue;
    private Long idNotifications;
    private Integer priority;
    private String chanel;
}
