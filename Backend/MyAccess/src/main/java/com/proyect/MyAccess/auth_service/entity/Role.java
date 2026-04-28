package com.proyect.MyAccess.auth_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name ="roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;
    @Column(name ="name_role")
    private String nameRole;
    @Column(name="description")
    private String description;
    @Column(name="asset")
    private Boolean asset;
    @Column(name="date_creation")
    private LocalDateTime dateCreation;
}
