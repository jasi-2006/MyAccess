package com.proyect.MyAccess.news_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "kind_novently")
public class KindNovently {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_novently")
    private Long idNovently;

    @Column(name = "name")
    private String name;

    @Column(name = "category")
    private String category;

    @Column(name = "requires_approval")
    private Boolean requiresApproval = false;

    @Column(name = "description")
    private String description;

    @Column(name = "activo")
    private Boolean activo = true;
}
