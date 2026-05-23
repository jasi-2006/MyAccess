package com.proyect.notifications_service.dto;

import lombok.Data;

@Data
public class ConfigRequestDTO {
    private String clue;
    private String value;
    private String description;
    private Integer modifiedBy;
}
