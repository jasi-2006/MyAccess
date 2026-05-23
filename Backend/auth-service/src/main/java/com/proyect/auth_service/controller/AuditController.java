package com.proyect.auth_service.controller;

import com.proyect.auth_service.dto.AuditRequestDTO;
import com.proyect.auth_service.dto.AuditResponseDTO;
import com.proyect.auth_service.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/*
 * Controlador REST para la gestión de registros de auditoría.
 * Expone endpoints para registrar acciones realizadas en el sistema.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/register")
public class AuditController {

    private final AuditService auditService;

    /*
     * Registra una nueva entrada de auditoría en el sistema.
     * @param dto Datos del registro de auditoría
     * @return ResponseEntity con el registro creado y estado 201 Created
     */
    @PostMapping("/audit")
    public ResponseEntity<AuditResponseDTO> create(@RequestBody AuditRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auditService.create(dto));
    }
}
