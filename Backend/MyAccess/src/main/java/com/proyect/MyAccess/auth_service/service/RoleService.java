package com.proyect.MyAccess.auth_service.service;

import com.proyect.MyAccess.auth_service.dto.RoleRequestDTO;
import com.proyect.MyAccess.auth_service.dto.RoleResponseDTO;
import com.proyect.MyAccess.auth_service.entity.Role;
import com.proyect.MyAccess.auth_service.repository.RoleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class RoleService {
    public final RoleRepository roleRepository;

    public RoleResponseDTO create (RoleRequestDTO requestDTO){
        Role role = new Role();
        role.setNameRole(requestDTO.getNameRole());
        role.setDescription(requestDTO.getDescription());
        role.setAccessLevel(requestDTO.getAccessLevel());
        role.setAssest(requestDTO.getAssest());
        role.setDateCreation(requestDTO.getDateCreation());

        Role  saved =roleRepository.save(role);

        RoleResponseDTO responseDTO = new RoleResponseDTO();


    }
}
