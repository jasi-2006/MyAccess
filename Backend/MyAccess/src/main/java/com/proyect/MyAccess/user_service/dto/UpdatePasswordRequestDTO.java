package com.proyect.MyAccess.user_service.dto;

import lombok.Data;

@Data
public class UpdatePasswordRequestDTO {
    private String email;
    private String currentPassword;
    private String newPassword;
}
