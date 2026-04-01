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

@Service
@RequiredArgsConstructor
@Transactional
public class PermissionService {
    public final PermissionRepository permissionRepository;
    public final RoleRepository roleRepository;

    public PermissionResponseDTO create(PermissionRequestDTO requestDTO) {
        Permissions permission = new Permissions();
        permission.setDescription(requestDTO.getDescription());
        permission.setPermissionCode(requestDTO.getPermissionCode());
        permission.setPermissionName(requestDTO.getPermissionName());
        permission.setModule(requestDTO.getModule());

        if (requestDTO.getIdRole() != null) {
            Role role = roleRepository.findById(requestDTO.getIdRole())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado con id: " + requestDTO.getIdRole()));
            permission.setRole(role);
        }

        permissionRepository.save(permission);

        PermissionResponseDTO responseDTO = new PermissionResponseDTO();
        responseDTO.setId(permission.getId());
        responseDTO.setDescription(permission.getDescription());
        responseDTO.setPermissionCode(permission.getPermissionCode());
        responseDTO.setPermissionName(permission.getPermissionName());
        responseDTO.setModule(permission.getModule());
        responseDTO.setIdRole(permission.getRole() != null ? permission.getRole().getId() : null);
        return responseDTO;
    }
}
