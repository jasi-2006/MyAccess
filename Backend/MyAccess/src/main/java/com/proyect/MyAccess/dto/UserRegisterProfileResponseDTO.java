package com.proyect.MyAccess.dto;

import lombok.Data;

@Data
public class UserRegisterProfileResponseDTO {
    private long id;
    private String document;
    private String name;
    private String lastName;
    private String password;
    private String email;
    private String phone;
    private String nameRole;
    private String tokenNumber;
    private String trainingProgram;
    private String trainingCenter;
    private String bloodType;
    private String regional;
}
