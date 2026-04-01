package com.proyect.MyAccess.user_service.dto;

import lombok.Data;

@Data
public class UserRegisterProfileRequestDTO {
    private String document;
    private String name;
    private String lastName;
    private String phone;
    private String nameRole;
    private String regional;
    private String bloodType;
    private String trainingCenter;
    private String trainingProgram;
    private String email;
    private String password;
}
