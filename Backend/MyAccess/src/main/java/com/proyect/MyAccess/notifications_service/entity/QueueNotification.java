package com.proyect.MyAccess.notifications_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "queue_notifications")
public class QueueNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_queue")
    private Long idQueue;

    @Column(name = "priority")
    private Integer priority = 5;

    @Column(name = "chanel")
    private String chanel;

    @ManyToOne
    @JoinColumn(name = "id_notifications")
    private Notification notification;
}
