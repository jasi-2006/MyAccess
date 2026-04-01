package com.proyect.MyAccess.news_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NoventlyRequestDTO {
    private Integer idUser;
    private Long fkIdNovently;
    private Integer registerBy;
    private String title;
    private String description;
    private String evidencesUrl;
    private String stated;
    private String priority;
    private LocalDateTime resolutionDate;
    private LocalDateTime followDate;
}
