package com.proyect.user_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserRegisterEventsRequestsDTO {
    private String tipeEvent;
    private Boolean processed;
    private LocalDateTime eventDate;
    private String descriptions;
    private Long idUser;
}
