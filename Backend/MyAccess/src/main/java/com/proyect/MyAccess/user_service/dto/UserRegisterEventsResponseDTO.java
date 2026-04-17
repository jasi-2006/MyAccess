package com.proyect.MyAccess.user_service.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UserRegisterEventsResponseDTO {
    private Long id;
    private String typeEvent;
    private Boolean processed;
    private LocalDate eventDate;
    private String description;
    private Long idUser;
}
