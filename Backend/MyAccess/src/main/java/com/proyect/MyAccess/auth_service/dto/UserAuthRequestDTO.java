package com.proyect.MyAccess.auth_service.dto;

import lombok.Data;

@Data
public class UserAuthRequestDTO {
    private String documentType;
    private String numberDocument;
    private String email;
    private String password;
    private Boolean verifiedEmail;
    private Long idRole;
}
