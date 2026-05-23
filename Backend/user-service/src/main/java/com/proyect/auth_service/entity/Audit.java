package com.proyect.auth_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;


@Entity
@Data
@Table(name="audit")
public class Audit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;
    @Column(name="id_user")
    private Integer idUser;
    @Column(name="acction")
    private String acction;
    @Column(name="module")
    private String module;
    @Column(name="description")
    private String description;

    @Column(name ="audit_date")
    private LocalDateTime auditDate;

}
