package com.proyect.MyAccess.auth_service.service;

import com.proyect.MyAccess.auth_service.dto.PermissionRequestDTO;
import com.proyect.MyAccess.auth_service.dto.PermissionResponseDTO;
import com.proyect.MyAccess.auth_service.entity.Permissions;
import com.proyect.MyAccess.auth_service.repository.PermissionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class PermissionService {
    public final PermissionRepository permissionRepository;

    public PermissionResponseDTO create (PermissionRequestDTO requestDTO){
        Permissions permission= new Permissions();
        permission.setDescription(requestDTO.getDescription());
        permission.setPermissionCode(requestDTO.getPermissionCode());
        permission.setPermissionName(requestDTO.getPermissionName());
        permission.setModule(requestDTO.getModule());

        Permissions saved =permissionRepository.save(permission);


        PermissionResponseDTO responseDTO = new PermissionResponseDTO();
        responseDTO.setId(saved.getId());
        responseDTO.setDescription(saved.getDescription());
        responseDTO.setPermissionCode(saved.getPermissionCode());
        responseDTO.setPermissionName(saved.getPermissionName());
        responseDTO.setModule(saved.getModule());
        return  responseDTO;
    }

}
