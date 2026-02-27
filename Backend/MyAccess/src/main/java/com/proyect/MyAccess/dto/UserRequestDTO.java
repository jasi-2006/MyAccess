package com.proyect.MyAccess.dto;

import lombok.Data;

@Data
public class UserRequestDTO {
   private String document;
   private String name;
   private String lastName;
   private String email;
   private String password;
   private String phone;
   private String role;
}
