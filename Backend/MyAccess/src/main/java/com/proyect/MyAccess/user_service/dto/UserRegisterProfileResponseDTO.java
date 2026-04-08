package com.proyect.MyAccess.user_service.dto;

import lombok.Data;

@Data
public class UserRegisterProfileResponseDTO {
    private Long id;
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

    public String getName(){ return fullName; }

    public String getEmail(){ return email; }

    public String getPassword(){ return password; }
}
