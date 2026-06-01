package com.proyect.news_service.dto;

import lombok.Data;

@Data
public class KindNoventlyRequestDTO {
    private String name;
    private String category;
    private Boolean requiresApproval;
    private String description;
    private Boolean activo;
}
