package com.proyect.MyAccess.auth_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RoleResponseDTO {
    private Long id;
    private String nameRole;
    private String description;
    private Boolean accessLevel;
    private Boolean asset;
    private LocalDateTime dateCreation;
}
