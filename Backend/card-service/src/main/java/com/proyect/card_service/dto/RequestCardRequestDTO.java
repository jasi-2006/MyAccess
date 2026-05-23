package com.proyect.card_service.dto;

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
