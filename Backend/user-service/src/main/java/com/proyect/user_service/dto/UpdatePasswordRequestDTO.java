package com.proyect.user_service.dto;

import lombok.Data;

@Data
public class UpdatePasswordRequestDTO {
    private String currentPassword;
    private String newPassword;
}
