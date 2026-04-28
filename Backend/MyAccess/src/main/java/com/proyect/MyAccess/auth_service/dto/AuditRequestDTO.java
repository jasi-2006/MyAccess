package com.proyect.MyAccess.auth_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuditRequestDTO {
    private Integer idUser;
    private String acction;
    private String module;
    private String description;
    private LocalDateTime auditDate;
}
