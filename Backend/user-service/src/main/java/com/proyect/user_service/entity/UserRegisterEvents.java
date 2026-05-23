package com.proyect.user_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;


@Data
@Entity
@Table(name="user_events")
public class UserRegisterEvents {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;
    @Column(name="tipeEvent")
    private String tipeEvent;
    @Column(name="processed")
    private Boolean processed;
    @Column(name="eventDate")
    private LocalDateTime eventDate;
    @Column(name="descriptions")
    private String descriptions;
    @ManyToOne
    @JoinColumn(name="idUser")
    private UserRegisterProfile userProfile;
}
