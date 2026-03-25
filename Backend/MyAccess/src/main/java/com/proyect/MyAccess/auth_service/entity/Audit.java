package com.proyect.MyAccess.auth_service.entity;

import jakarta.persistence.*;
import lombok.Data;


@Entity
@Data
@Table(name ="user_profile")
public class Audit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private long id;
    @Column (name ="id_user")
    private Integer idUser;
    @Column (name ="accion")
    private String accion;
    @Column (name ="module ")
    private String  module;
    @Column(name ="description")
    private String description;
}