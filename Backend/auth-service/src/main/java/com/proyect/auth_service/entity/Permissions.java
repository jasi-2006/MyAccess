package com.proyect.auth_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "permissions")
public class Permissions {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @Column(name = "permission_code")
    private String permissionCode;
    @Column(name = "permission_name")
    private String permissionName;
    @Column(name = "description")
    private String description;
    @Column(name = "module")
    private String module;
    @ManyToOne
    @JoinColumn(name = "id_role")
    private Role role;
}
