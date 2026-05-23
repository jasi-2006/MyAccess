package com.proyect.MyAccess.card_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "card")
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_card")
    private Long idCard;

    @Column(name = "id_user", nullable = false)
    private Integer idUser;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "valid_photo")
    private Boolean validPhoto = false;

    @Column(name = "digital_state")
    private String digitalState = "pendiente";

    @Column(name = "physical_state")
    private String physicalState = "no solicitado";

    @Column(name = "active")
    private Boolean active = true;

    @Column(name = "digital_issue_date")
    private LocalDateTime digitalIssueDate;

    @Column(name = "physical_state_date")
    private LocalDateTime physicalStateDate;

    @Column(name = "expiration_date")
    private LocalDateTime expirationDate;

    @Column(name = "reprints")
    private Integer reprints = 0;

    @Column(name = "reason_for_last_reprints")
    private String reasonForLastReprints;
}
