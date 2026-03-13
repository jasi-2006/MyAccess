package com.proyect.MyAccess.dto;

import lombok.Data;

@Data
public class UserProfileRequestDTO {
    private String document;
    private String name;
    private String lastName;
    private String password;
    private String email;
    private String phone;
    private String tokenNumber;
    private String trainingProgram;
    private String trainingCenter;
    private String regional;
    private String bloodType;
    private String nameRole;
}
