package com.proyect.MyAccess.auth_service.service;

import com.proyect.MyAccess.auth_service.dto.AuditRequestDTO;
import com.proyect.MyAccess.auth_service.dto.AuditResponseDTO;
import com.proyect.MyAccess.auth_service.entity.Audit;
import com.proyect.MyAccess.auth_service.repository.AuditRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@RequiredArgsConstructor
@Service
@Transactional
public class AuditService {

    private final AuditRepository auditRepository;


    public AuditResponseDTO Created(AuditRequestDTO auditDTO) {

        Audit audit = new Audit();
        audit.setModule(auditDTO.getModule());
        audit.setDescription(auditDTO.getDescription());
        audit.setAccion(auditDTO.getAcction());
        audit.setIdUser(auditDTO.getIdUser());

        auditRepository.save(audit);

        AuditResponseDTO response = new AuditResponseDTO();
        response.setId(audit.getId());
        response.setModule(auditDTO.getModule());
        response.setAcction(auditDTO.getAcction());
        response.setIdUser(auditDTO.getIdUser());
        return  response;
    }
}
