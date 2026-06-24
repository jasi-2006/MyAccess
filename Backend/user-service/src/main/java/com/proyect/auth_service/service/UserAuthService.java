package com.proyect.auth_service.service;

import com.proyect.auth_service.dto.UserAuthRequestDTO;
import com.proyect.auth_service.dto.UserAuthResponseDTO;
import com.proyect.auth_service.entity.Role;
import com.proyect.auth_service.entity.UserAuth;
import com.proyect.auth_service.repository.RoleRepository;
import com.proyect.auth_service.repository.UserAuthRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

/*
 * Servicio para gestionar las credenciales de autenticaci贸n de los usuarios.
 * Maneja la creaci贸n de cuentas con encriptaci贸n de contrase帽a y asignaci贸n de rol.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserAuthService {

    private final UserAuthRepository userAuthRepository;
    private final RoleRepository roleRepository;

    public void updatePasswordByEmail(String email, String currentPassword, String newPassword) {
        String normalizedEmail = email == null ? null : email.trim().toLowerCase();
        String normalizedCurrentPassword = currentPassword == null ? "" : currentPassword.trim();
        String normalizedNewPassword = newPassword == null ? "" : newPassword.trim();

        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new IllegalArgumentException("No se pudo identificar el usuario autenticado.");
        }
        if (normalizedCurrentPassword.isBlank()) {
            throw new IllegalArgumentException("La contrase馻 actual es obligatoria.");
        }
        if (normalizedNewPassword.length() < 8) {
            throw new IllegalArgumentException("La nueva contrase馻 debe tener al menos 8 caracteres.");
        }

        UserAuth user = userAuthRepository.findByEmailWithRole(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("No se encontro la cuenta de acceso."));

        if (!BCrypt.checkpw(normalizedCurrentPassword, user.getPassword())) {
            throw new IllegalArgumentException("La contrase馻 actual no es correcta.");
        }

        user.setPassword(BCrypt.hashpw(normalizedNewPassword, BCrypt.gensalt()));
        userAuthRepository.save(user);
    }
    /*
     * Crea las credenciales de autenticaci贸n para un nuevo usuario.
     * Si no se proporciona idRole, asigna el rol APRENDIZ por defecto.
     * La contrase帽a se almacena encriptada con BCrypt.
     * @param dto Datos de autenticaci贸n incluyendo email, password e idRole opcional
     * @return UserAuthResponseDTO con los datos de la cuenta creada
     */
    public UserAuthResponseDTO create(UserAuthRequestDTO dto) {
        if (userAuthRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("El email ya est谩 registrado");
        }

        Role role;
        if (dto.getIdRole() != null) {
            role = roleRepository.findById(dto.getIdRole())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        } else {
            role = roleRepository.findByNameRoleIgnoreCase("APRENDIZ")
                    .orElseThrow(() -> new RuntimeException("Rol APRENDIZ no configurado"));
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
     * @param user Entidad de autenticaci贸n a convertir
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
