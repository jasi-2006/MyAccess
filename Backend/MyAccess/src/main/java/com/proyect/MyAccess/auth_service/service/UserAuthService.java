package com.proyect.MyAccess.auth_service.service;

import com.proyect.MyAccess.auth_service.dto.UserAuthRequestDTO;
import com.proyect.MyAccess.auth_service.dto.UserAuthResponseDTO;
import com.proyect.MyAccess.auth_service.entity.Role;
import com.proyect.MyAccess.auth_service.entity.UserAuth;
import com.proyect.MyAccess.auth_service.repository.RoleRepository;
import com.proyect.MyAccess.auth_service.repository.UserAuthRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

/*
 * Servicio para gestionar las credenciales de autenticación de los usuarios.
 * Maneja la creación de cuentas con encriptación de contraseña y asignación de rol.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserAuthService {

    private final UserAuthRepository userAuthRepository;
    private final RoleRepository roleRepository;

    /*
     * Crea las credenciales de autenticación para un nuevo usuario.
     * Si no se proporciona idRole, asigna el rol APRENDIZ por defecto.
     * La contraseña se almacena encriptada con BCrypt.
     * @param dto Datos de autenticación incluyendo email, password e idRole opcional
     * @return UserAuthResponseDTO con los datos de la cuenta creada
     */
    public UserAuthResponseDTO create(UserAuthRequestDTO dto) {
        if (userAuthRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        Role role;
        if (dto.getIdRole() != null) {
            role = roleRepository.findById(dto.getIdRole())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        } else {
            role = roleRepository.findByNameRole("APRENDIZ").orElse(null);
        }

        UserAuth user = new UserAuth();
        user.setEmail(dto.getEmail());
        user.setPassword(BCrypt.hashpw(dto.getPassword(), BCrypt.gensalt()));
        user.setVerifiedEmail(false);
        user.setRole(role);
        userAuthRepository.save(user);
        return toResponse(user);
    }

    /*
     * Convierte una entidad UserAuth en su DTO de respuesta.
     * @param user Entidad de autenticación a convertir
     * @return UserAuthResponseDTO con los datos mapeados
     */
    private UserAuthResponseDTO toResponse(UserAuth user) {
        UserAuthResponseDTO r = new UserAuthResponseDTO();
        r.setId(user.getId());
        r.setEmail(user.getEmail());
        r.setVerifiedEmail(user.getVerifiedEmail());
        r.setIdRole(user.getRole() != null ? user.getRole().getId() : null);
        return r;
    }
}
