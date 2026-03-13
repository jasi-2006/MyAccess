package com.proyect.MyAccess.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name= "user_profile")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name ="id")
    private Long id;
    @Column(name=" name")
    private String name ;
    @Column (name="last_name")
    private String lastName;
    @Column(name ="document")
    private String document;
    @Column (name ="phone")
    private String phone;
    @Column (name ="email")
    private String email;
    @Column (name ="token_number")
    private String  tokenNumber;
    @Column (name ="training_program")
    private String treainingProgram;
    @Column (name ="trainig_center")
    private String trainingCenter;
    @Column (name="regional")
    private String regional;

    @Column (name ="password")
    private String password;
    @Column (name ="name_role")
    private String nameRole;

}
