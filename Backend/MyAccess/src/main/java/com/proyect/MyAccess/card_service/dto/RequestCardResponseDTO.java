package com.proyect.MyAccess.card_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RequestCardResponseDTO {
    private Long idRequest;
    private Integer idUser;
    private String requestTipe;
    private String cardTipe;
    private String state;
    private String reasonRejection;
    private Integer approbedBy;
    private Integer printedBy;
    private LocalDateTime registrationDate;
    private Long idCard;
}
