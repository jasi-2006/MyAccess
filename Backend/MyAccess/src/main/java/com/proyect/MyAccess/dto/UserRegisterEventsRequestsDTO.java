package com.proyect.MyAccess.dto;

import lombok.Data;


import java.time.LocalDate;


@Data
public class UserRegisterEventsRequestsDTO {
    private String tipeEvent;
    private Boolean processed;
    private LocalDate eventDate;
    private Long idUser;

}
