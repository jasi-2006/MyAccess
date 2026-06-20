package com.proyect.user_service.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class RegisterRequestDTO {
    // user_auth
    private String email;
    private String password;


    // user_profile
    private String document;
    private String typeDocument;
    private String nombres;
    private String apellidos;
    private String fullName;
    private String trainingProgram;
    private String trainingCenter;
    private String regional;
    private String bloodType;
    private String nameRole;
    @JsonAlias("Ficha")
    private String ficha;
}
