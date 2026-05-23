package com.proyect.auth_service.dto;

import lombok.Data;

@Data
public class UserAuthRequestDTO {
    private String email;
    private String password;
    private Long idRole;
}
