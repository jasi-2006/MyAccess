package com.proyect.MyAccess.auth_service.service;

import com.proyect.MyAccess.auth_service.dto.UserAuthRequestDTO;
import com.proyect.MyAccess.auth_service.dto.UserAuthResponseDTO;
import com.proyect.MyAccess.auth_service.entity.Role;
import com.proyect.MyAccess.auth_service.entity.UserAuth;
import com.proyect.MyAccess.auth_service.repository.RoleRepository;
import com.proyect.MyAccess.auth_service.repository.UserAuthRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class UserAuthService {
    private final UserAuthRepository userAuthRepository;
    private final RoleRepository roleRepository;

    public UserAuthResponseDTO create (UserAuthRequestDTO requestDTO){
        Role role = roleRepository.findById(requestDTO.getIdRole())
                .orElseThrow(()->new RuntimeException("rol no encontrado"));
        UserAuth user = new UserAuth();
        user.setDocumentType(requestDTO.getDocumentType());
        user.setNumberDocument(requestDTO.getDocumentType());
        user.setEmail(requestDTO.getEmail());
        user.setPassword(requestDTO.getPassword());
        user.setVerifiedEmail(requestDTO.getVerifiedEmail());
        user.setRole(role);

        userAuthRepository.save(user);

        UserAuthResponseDTO responseDTO = new UserAuthResponseDTO();

        responseDTO.setId(user.getId());
        responseDTO.setIdRole(requestDTO.getIdRole());
        responseDTO.setDocumentType(requestDTO.getDocumentType());
        responseDTO.setVerifiedEmail(requestDTO.getVerifiedEmail());
        responseDTO.setEmail(requestDTO.getEmail());
        responseDTO.setPassword(requestDTO.getPassword());
        responseDTO.setNumberDocument(requestDTO.getNumberDocument());
        return  responseDTO;
    }
}
