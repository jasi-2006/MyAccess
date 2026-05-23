package com.proyect.card_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "request_card")
public class RequestCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_request")
    private Long idRequest;

    @Column(name = "id_user", nullable = false)
    private Integer idUser;

    @Column(name = "request_tipe", nullable = false)
    private String requestTipe;

    @Column(name = "card_tipe", nullable = false)
    private String cardTipe;

    @Column(name = "state")
    private String state = "pendiente";

    @Column(name = "reason_rejection")
    private String reasonRejection;

    @Column(name = "approbed_by")
    private Integer approbedBy;

    @Column(name = "printed_by")
    private Integer printedBy;

    @Column(name = "registration_date")
    private LocalDateTime registrationDate;

    @ManyToOne
    @JoinColumn(name = "id_card")
    private Card card;
}
