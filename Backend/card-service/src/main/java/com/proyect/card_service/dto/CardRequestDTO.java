package com.proyect.card_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CardRequestDTO {
    private Integer idUser;
    private String photoUrl;
    private Boolean validPhoto;
    private String digitalState;
    private String physicalState;
    private Boolean active;
    private LocalDateTime digitalIssueDate;
    private LocalDateTime physicalStateDate;
    private LocalDateTime expirationDate;
    private Integer reprints;
    private String reasonForLastReprints;
}
