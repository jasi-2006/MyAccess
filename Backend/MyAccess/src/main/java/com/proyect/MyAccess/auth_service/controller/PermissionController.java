package com.proyect.MyAccess.auth_service.controller;

import com.proyect.MyAccess.auth_service.dto.PermissionRequestDTO;
import com.proyect.MyAccess.auth_service.dto.PermissionResponseDTO;
import com.proyect.MyAccess.auth_service.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/*
 * Controlador REST para la gestión de permisos del sistema.
 * Expone endpoints para crear y asociar permisos a roles.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/register")
public class PermissionController {

    private final PermissionService permissionService;

    /*
     * Crea un nuevo permiso y lo asocia a un rol si se proporciona idRole.
     * @param dto Datos del permiso a crear
     * @return ResponseEntity con el permiso creado y estado 201 Created
     */
    @PostMapping("/permissions")
    public ResponseEntity<PermissionResponseDTO> create(@RequestBody PermissionRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(permissionService.create(dto));
    }
}
