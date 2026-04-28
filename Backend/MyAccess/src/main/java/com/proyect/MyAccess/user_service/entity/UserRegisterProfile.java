package com.proyect.MyAccess.user_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "user_profile")
public class UserRegisterProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document", nullable = false, unique = true)
    private String document;

    @Column(name = "type_document")
    private String typeDocument;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "trainingProgram")
    private String trainingProgram;

    @Column(name = "trainingCenter")
    private String trainingCenter;

    @Column(name = "regional")
    private String regional;

    @Column(name = "bloodType")
    private String bloodType;

    @Column(name = "nameRole")
    private String nameRole;

    @Column(name = "ficha")
    private String ficha;

    @Column(name = "email", unique = true)
    private String email;
}
