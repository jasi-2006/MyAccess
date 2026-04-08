package com.proyect.MyAccess.user_service.dto;

import lombok.Data;

@Data
public class UserRegisterProfileRequestDTO {
    private String document;
    private String documentType;
    private String fullName;
    private String password;
    private String email;
    private String phone;
    private String nameRole;
    private String trainingProgram;
    private String trainingCenter;
    private String bloodType;
    private String regional;
}
