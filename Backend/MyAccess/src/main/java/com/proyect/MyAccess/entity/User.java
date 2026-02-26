package com.proyect.MyAccess.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name= "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name ="id")
    private long id;
    @Column(name="document")
    private String document;
    @Column (name="name")
    private String name;
    @Column (name="lastName")
    private String lastName;
    @Column (name = "email")
    private String email;
    @Column (name = "password")
    private  String password;
    @Column(name="phone")
    private String phone;

    @ManyToOne
    @JoinColumn(name="id_role")
    private Role role;
}
