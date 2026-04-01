package com.proyect.MyAccess.card_service.dto;

import lombok.Data;

@Data
public class RequestCardRequestDTO {
    private Integer idUser;
    private String requestTipe;
    private String cardTipe;
    private String state;
    private String reasonRejection;
    private Integer approbedBy;
    private Integer printedBy;
    private Long idCard;
}
