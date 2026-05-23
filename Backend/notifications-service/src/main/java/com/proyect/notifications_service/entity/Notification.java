package com.proyect.notifications_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notifications")
    private Long idNotifications;

    @Column(name = "id_user")
    private Integer idUser;

    @Column(name = "tipe")
    private String tipe;

    @Column(name = "category")
    private String category;

    @Column(name = "affair")
    private String affair;

    @Column(name = "messaje")
    private String messaje;

    @Column(name = "stated_send")
    private String statedSend = "pendiente";

    @Column(name = "send_date")
    private LocalDateTime sendDate;

    @Column(name = "reading_date")
    private LocalDateTime readingDate;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @ManyToOne
    @JoinColumn(name = "id_config")
    private Config config;
}
