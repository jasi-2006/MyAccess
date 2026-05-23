package com.proyect.notifications_service.dto;

import lombok.Data;

@Data
public class QueueNotificationRequestDTO {
    private Long idNotifications;
    private Integer priority;
    private String chanel;
}
