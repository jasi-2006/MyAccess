package com.proyect.MyAccess.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UserRegisterEventsResponseDTO {
    private Long id;
    private String tipeEvent;
    private Boolean processed;
    private LocalDate eventDate;
    private long idUser;
}
