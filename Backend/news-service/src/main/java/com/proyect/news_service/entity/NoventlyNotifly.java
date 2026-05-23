package com.proyect.news_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "novently_notifly")
@IdClass(NoventlyNotifly.NoventlyNotiflyId.class)
public class NoventlyNotifly {

    @Id
    @Column(name = "id_novently")
    private Long idNovently;

    @Id
    @Column(name = "id_user")
    private Integer idUser;

    @Id
    @Column(name = "chanel")
    private String chanel;

    @Column(name = "send")
    private Boolean send = false;

    @Column(name = "reading")
    private Boolean reading = false;

    @Column(name = "send_date")
    private LocalDateTime sendDate;

    @ManyToOne
    @JoinColumn(name = "id_novently", insertable = false, updatable = false)
    private Novently novently;

    @Data
    public static class NoventlyNotiflyId implements Serializable {
        private Long idNovently;
        private Integer idUser;
        private String chanel;
    }
}
