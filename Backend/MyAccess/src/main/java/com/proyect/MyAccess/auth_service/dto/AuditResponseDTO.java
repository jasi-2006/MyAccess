package com.proyect.MyAccess.auth_service.dto;

import lombok.Data;

@Data
public class AuditResponseDTO {
    private Long id;
    private Integer idUser;
    private String acction;
    private String module;
    private String description;

}
