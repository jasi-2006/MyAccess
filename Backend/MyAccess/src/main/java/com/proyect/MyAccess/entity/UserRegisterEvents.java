package com.proyect.MyAccess.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;


@Data
@Entity
@Table (name="user_events")
public class UserRegisterEvents {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (name="id")
    private Long id;
    @Column(name="tipeEvent")
    private String tipeEvent;
    @Column(name ="processed")
    private Boolean processed;
    @Column(name ="eventDate")
    private LocalDate eventDate;

    // relation of the tables
    @ManyToOne
    @JoinColumn(name="idUser")
    private UserRegisterProfile userProfile;
}
