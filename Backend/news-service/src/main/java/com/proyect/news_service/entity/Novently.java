package com.proyect.news_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "novently")
public class Novently {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_novently")
    private Long idNovently;

    @Column(name = "id_user", nullable = false)
    private Integer idUser;

    @Column(name = "register_by")
    private Integer registerBy;

    @Column(name = "title")
    private String title;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "evidences_url")
    private String evidencesUrl;

    @Column(name = "stated")
    private String stated = "activo";

    @Column(name = "priority")
    private String priority = "media";

    @Column(name = "register_date")
    private LocalDateTime registerDate;

    @Column(name = "resolution_date")
    private LocalDateTime resolutionDate;

    @Column(name = "follow_date")
    private LocalDateTime followDate;

    @Column(name = "notification_send")
    private Boolean notificationSend = false;

    @Column(name = "notification_date")
    private LocalDateTime notificationDate;

    @ManyToOne
    @JoinColumn(name = "fk_id_novently")
    private KindNovently kindNovently;
}
