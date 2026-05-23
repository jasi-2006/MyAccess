package com.proyect.auth_service.service;

import com.proyect.auth_service.dto.AuditRequestDTO;
import com.proyect.auth_service.dto.AuditResponseDTO;
import com.proyect.auth_service.entity.Audit;
import com.proyect.auth_service.repository.AuditRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/*
 * Servicio para gestionar los registros de auditoría del sistema.
 * Permite registrar acciones realizadas por los usuarios en los distintos módulos.
 */
@RequiredArgsConstructor
@Service
@Transactional
public class AuditService {

    private final AuditRepository auditRepository;

    /*
     * Crea y persiste un nuevo registro de auditoría.
     * @param dto Datos del registro de auditoría a crear
     * @return AuditResponseDTO con los datos del registro creado
     */
    public AuditResponseDTO create(AuditRequestDTO dto) {
        Audit audit = new Audit();
        audit.setModule(dto.getModule());
        audit.setDescription(dto.getDescription());
        audit.setIdUser(dto.getIdUser());
        audit.setAuditDate(dto.getAuditDate());
        audit.setAcction(dto.getAcction());
        auditRepository.save(audit);
        return toResponse(audit);
    }

    /*
     * Convierte una entidad Audit en su DTO de respuesta.
     * @param audit Entidad de auditoría a convertir
     * @return AuditResponseDTO con los datos mapeados
     */
    private AuditResponseDTO toResponse(Audit audit) {
        AuditResponseDTO r = new AuditResponseDTO();
        r.setId(audit.getId());
        r.setModule(audit.getModule());
        r.setAcction(audit.getAcction());
        r.setIdUser(audit.getIdUser());
        r.setAuditDate(audit.getAuditDate());
        r.setDescription(audit.getDescription());
        return r;
    }
}
