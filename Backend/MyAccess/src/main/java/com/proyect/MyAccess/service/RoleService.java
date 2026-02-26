package com.proyect.MyAccess.service;

import com.proyect.MyAccess.dto.RoleRequestDTO;
import com.proyect.MyAccess.dto.RoleResponseDTO;
import com.proyect.MyAccess.entity.Role;
import com.proyect.MyAccess.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;



@RequiredArgsConstructor
@Service
public class RoleService {
    private final RoleRepository roleRepository;

    public RoleResponseDTO roleCreated(@NonNull RoleRequestDTO roleRequestDTO){
        Role role = new Role();
        role.setNameRole(roleRequestDTO.getNameRole());

        roleRepository.save(role);

        RoleResponseDTO roleResponseDTO = new RoleResponseDTO();
        roleResponseDTO.setId(role.getId());
        roleResponseDTO.setNameRole(role.getNameRole());

        return roleResponseDTO;
    }

    public RoleResponseDTO getForName(String role){
        Role roles = roleRepository.findByNameRole(role)
                .orElseThrow(()-> new RuntimeException("el rol"+ role+ "no existe"));
        RoleResponseDTO responseDTO = new RoleResponseDTO();
        responseDTO.setId(roles.getId());
        responseDTO.setNameRole(roles.getNameRole());
        return responseDTO;
    }

}
