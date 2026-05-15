package com.proyect.MyAccess.notifications_service.dto;

import lombok.Data;

@Data
public class NotificationRequestDTO {
    private Integer idUser;
    private String tipe;
    private String category;
    private String affair;
    private String messaje;
    private String statedSend;
    private Long idConfig;
}
