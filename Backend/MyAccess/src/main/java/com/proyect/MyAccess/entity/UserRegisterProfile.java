package com.proyect.MyAccess.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name= "user_profile")
public class UserRegisterProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name ="id")
    private Long id;
    @Column(name="name")
    private String name;
    @Column (name="lastName")
    private String lastName;
    @Column(name ="document")
    private String document;
    @Column (name ="phone")
    private String phone;
    @Column (name ="email")
    private String email;
    @Column (name ="tokenNumber")
    private String  tokenNumber;
    @Column (name ="trainingProgram")
    private String trainingProgram;
    @Column (name ="trainingCenter")
    private String trainingCenter;
    @Column (name="regional")
    private String regional;
    @Column(name="bloodType")
    private String bloodType;
    @Column (name ="password")
    private String password;
    @Column (name ="nameRole")
    private String nameRole;
}
