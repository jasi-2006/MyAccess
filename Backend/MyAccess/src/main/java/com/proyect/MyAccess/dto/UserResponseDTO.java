package com.proyect.MyAccess.dto;

import lombok.Data;

@Data
public class UserResponseDTO {
    private long id;
    private String document;
    private String name;
    private String lastName;
    private String password;
    private String email;
    private String phone;
    private RoleResponseDTO role;
}
