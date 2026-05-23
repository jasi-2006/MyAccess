package com.proyect.MyAccess.auth_service.dto;

import lombok.Data;

@Data
public class UserAuthResponseDTO {
    private Long id;
    private String email;
    private Boolean verifiedEmail;
    private Long idRole;
}
