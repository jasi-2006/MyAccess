package com.proyect.MyAccess.dto;

import lombok.Data;

@Data
public class UserLoginRequestDTO {
    private String email;      // ← ¿Coincide con el JSON que envías?
    private String password;   // ← ¿Coincide con el JSON?
}
