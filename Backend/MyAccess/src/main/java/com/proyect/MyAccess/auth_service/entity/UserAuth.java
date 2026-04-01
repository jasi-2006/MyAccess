package com.proyect.MyAccess.auth_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name="user_auth")
public class UserAuth {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;
    @Column(name = "document_type")
    private String documentType;
    @Column (name="numberDocument")
    private String numberDocument;
    @Column(name ="email")
    private String email;
    @Column(name ="password")
    private String password;
    @Column (name = "verified_email")
    private Boolean verifiedEmail;

    @ManyToOne
    @JoinColumn(name = "id_role")
    private Role role;


}
