package com.proyect.MyAccess.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name="role")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (name ="id")
    private long id;

    @Column (name ="name_role")
    private String nameRole;
}
