package com.proyect.auth_service.dto;

import lombok.Data;

@Data
public class PermissionResponseDTO {
    private Long id;
    private String permissionCode;
    private String permissionName;
    private String description;
    private String module;
    private Long idRole;
}
