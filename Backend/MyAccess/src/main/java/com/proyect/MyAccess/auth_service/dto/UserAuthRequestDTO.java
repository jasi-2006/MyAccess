package com.proyect.MyAccess.auth_service.dto;

import lombok.Data;

@Data
public class UserAuthRequestDTO {
    private String email;
    private String password;
    private Long idRole;
}
