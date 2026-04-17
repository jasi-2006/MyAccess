package com.proyect.MyAccess.user_service.entity;

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
    @Column(name="typeEvent")
    private String typeEvent;
    @Column(name ="processed")
    private Boolean processed;
    @Column(name ="eventDate")
    private LocalDate eventDate;
    @Column(name="descriptions")
    private String description;

    // relation of the tables
    @ManyToOne
    @JoinColumn(name="idUser")
    private UserRegisterProfile userProfile;

    public void setIdUser(Long id) {

    }
}