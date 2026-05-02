package com.proyect.MyAccess.user_service.dto;

import lombok.Data;

@Data
public class UserRegisterProfileResponseDTO {
    private Long id;
    private String document;
    private String typeDocument;
    private String fullName;
    private String trainingProgram;
    private String trainingCenter;
    private String regional;
    private String bloodType;
    private String nameRole;
    private String ficha;
    private String email;
    private String photoUrl;
}
