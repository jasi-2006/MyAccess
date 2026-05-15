package com.proyect.MyAccess.auth_service.service;

import com.proyect.MyAccess.auth_service.dto.PermissionRequestDTO;
import com.proyect.MyAccess.auth_service.dto.PermissionResponseDTO;
import com.proyect.MyAccess.auth_service.entity.Permissions;
import com.proyect.MyAccess.auth_service.entity.Role;
import com.proyect.MyAccess.auth_service.repository.PermissionRepository;
import com.proyect.MyAccess.auth_service.repository.RoleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/*
 * Servicio para gestionar los permisos del sistema.
 * Permite crear permisos y asociarlos a roles existentes.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    /*
     * Crea un nuevo permiso y lo asocia a un rol si se proporciona idRole.
     * @param dto Datos del permiso a crear, incluyendo opcionalmente el idRole
     * @return PermissionResponseDTO con los datos del permiso creado
     */
    public PermissionResponseDTO create(PermissionRequestDTO dto) {
        Permissions permission = new Permissions();
        permission.setDescription(dto.getDescription());
        permission.setPermissionCode(dto.getPermissionCode());
        permission.setPermissionName(dto.getPermissionName());
        permission.setModule(dto.getModule());

        if (dto.getIdRole() != null) {
            Role role = roleRepository.findById(dto.getIdRole())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado con id: " + dto.getIdRole()));
            permission.setRole(role);
        }

        permissionRepository.save(permission);
        return toResponse(permission);
    }

    /*
     * Convierte una entidad Permissions en su DTO de respuesta.
     * @param permission Entidad de permiso a convertir
     * @return PermissionResponseDTO con los datos mapeados
     */
    private PermissionResponseDTO toResponse(Permissions permission) {
        PermissionResponseDTO r = new PermissionResponseDTO();
        r.setId(permission.getId());
        r.setDescription(permission.getDescription());
        r.setPermissionCode(permission.getPermissionCode());
        r.setPermissionName(permission.getPermissionName());
        r.setModule(permission.getModule());
        r.setIdRole(permission.getRole() != null ? permission.getRole().getId() : null);
        return r;
    }
}
