package com.proyect.MyAccess.auth_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RoleRequestDTO {
    private String nameRole;
    private String description;
    private Boolean accessLevel;
    private Boolean assest;
    private LocalDateTime dateCreation;
}
