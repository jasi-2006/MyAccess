package com.proyect.MyAccess.notifications_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConfigResponseDTO {
    private Long idConfig;
    private String clue;
    private String value;
    private String description;
    private Integer modifiedBy;
    private LocalDateTime modifiedDate;
}
