package com.proyect.MyAccess.news_service.dto;

import lombok.Data;

@Data
public class KindNoventlyResponseDTO {
    private Long idNovently;
    private String name;
    private String category;
    private Boolean requiresApproval;
    private String description;
    private Boolean activo;
}
