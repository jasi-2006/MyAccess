package com.proyect.MyAccess.notifications_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponseDTO {
    private Long idNotifications;
    private Integer idUser;
    private String tipe;
    private String category;
    private String affair;
    private String messaje;
    private String statedSend;
    private LocalDateTime sendDate;
    private LocalDateTime readingDate;
    private LocalDateTime createdDate;
    private Long idConfig;
}
