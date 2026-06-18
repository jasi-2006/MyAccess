package com.proyect.user_service.dto;

import lombok.Data;

@Data
public class SocialLoginRequestDTO {
    private String email;
    private String provider;
}
