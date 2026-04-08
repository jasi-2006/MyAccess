package com.proyect.MyAccess.user_service.entity;

import jakarta.persistence.*;
import lombok.Data;


import java.time.LocalDateTime;

@Entity
@Data
@Table(name ="user_profile")
public class UserRegisterProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name ="document")
    private String document;
    @Column(name="document_tipe")
    private String documentType;
    @Column(name ="full_name")
    private String fullName;
    @Column(name ="phone")
    private String phone;
    @Column(name="nameRole")
    private String nameRole;
    @Column(name ="bloodType")
    private String bloodType;
    @Column(name ="regional")
    private String regional;
    @Column(name="trainingCenter")
    private String trainingCenter;
    @Column(name ="trainingProgram")
    private String trainingProgram;
    @Column(name="email")
    private String email;
    @Column(name="password")
    private String password;
    @Column (name="verificationCode")
    private String verificationCode;
    @Column (name= "codeExpiration")
    private LocalDateTime codeExpiration;
    @Column (name="verified")
    private Boolean verified;
}