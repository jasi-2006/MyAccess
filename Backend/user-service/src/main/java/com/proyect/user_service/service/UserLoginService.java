package com.proyect.user_service.service;

import com.proyect.auth_service.entity.Role;
import com.proyect.auth_service.entity.UserAuth;
import com.proyect.auth_service.repository.RoleRepository;
import com.proyect.auth_service.repository.UserAuthRepository;
import com.proyect.user_service.dto.AuthResponseDTO;
import com.proyect.user_service.dto.UserLoginRequestDTO;
import com.proyect.user_service.dto.SocialLoginRequestDTO;
import com.proyect.user_service.entity.UserRegisterProfile;
import com.proyect.user_service.repository.UserRegisterProfileRepository;
import com.proyect.user_service.util.RoleNameNormalizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserLoginService {

    private final UserAuthRepository userAuthRepository;
    private final UserRegisterProfileRepository userRegisterProfileRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;

    public AuthResponseDTO login(UserLoginRequestDTO request) {
        String email = normalizeEmail(request.getEmail());
        UserAuth user = userAuthRepository.findByEmailWithRole(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!BCrypt.checkpw(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Credenciales incorrectas");
        }
        if (!user.getVerifiedEmail()) {
            throw new RuntimeException("cuenta no verificada. revisa tu correo");
        }

        return generateAuthResponse(user);
    }

    public AuthResponseDTO socialLogin(SocialLoginRequestDTO request) {
        String email = normalizeEmail(request.getEmail());
        if (email == null || email.isBlank()) {
            throw new RuntimeException("El correo es requerido");
        }

        UserAuth user = userAuthRepository.findByEmailWithRole(email)
                .orElseThrow(() -> new RuntimeException("El correo '" + email + "' no está registrado en el sistema. Por favor, regístrate primero."));

        if (!user.getVerifiedEmail()) {
            user.setVerifiedEmail(true);
            userAuthRepository.save(user);
        }

        return generateAuthResponse(user);
    }

    public AuthResponseDTO refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank() || !jwtService.isTokenValid(refreshToken)) {
            throw new RuntimeException("Refresh token invalido");
        }

        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new RuntimeException("El token enviado no es refresh token");
        }

        Long profileId = jwtService.extractUserId(refreshToken);
        UserRegisterProfile profile = userRegisterProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UserAuth user = userAuthRepository.findByEmailWithRole(normalizeEmail(profile.getEmail()))
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!user.getVerifiedEmail()) {
            throw new RuntimeException("cuenta no verificada. revisa tu correo");
        }

        return generateAuthResponse(user, profile);
    }

    private AuthResponseDTO generateAuthResponse(UserAuth user) {
        UserRegisterProfile profile = userRegisterProfileRepository.findByEmailIgnoreCase(user.getEmail())
                .orElseThrow(() -> new RuntimeException("El usuario no tiene perfil configurado"));
        return generateAuthResponse(user, profile);
    }

    private AuthResponseDTO generateAuthResponse(UserAuth user, UserRegisterProfile profile) {
        String effectiveRole = resolveEffectiveRole(user, profile);
        syncRoleAcrossTables(user, profile, effectiveRole);

        Long profileId = profile.getId();
        String email = normalizeEmail(user.getEmail());
        String token = jwtService.generateToken(profileId, email, effectiveRole);
        String refreshToken = jwtService.generateRefreshToken(profileId, email, effectiveRole);

        log.info("Login JWT role={} profileId={} email={}", effectiveRole, profileId, email);
        return new AuthResponseDTO(token, refreshToken, effectiveRole);
    }

    /**
     * Prioridad: ADMIN desde perfil o auth; luego perfil; luego auth; fallback APRENDIZ.
     */
    private String resolveEffectiveRole(UserAuth user, UserRegisterProfile profile) {
        String profileRaw = profile.getNameRole();
        if (profileRaw == null || profileRaw.isBlank()) {
            profileRaw = userRegisterProfileRepository.findNameRoleColumnByEmail(profile.getEmail()).orElse(null);
        }

        String authRaw = user.getRole() != null ? user.getRole().getNameRole() : null;

        String profileNorm = hasText(profileRaw) ? RoleNameNormalizer.normalize(profileRaw) : null;
        String authNorm = hasText(authRaw) ? RoleNameNormalizer.normalize(authRaw) : null;

        if ("ADMIN".equals(profileNorm) || "ADMIN".equals(authNorm)) {
            return "ADMIN";
        }
        if (profileNorm != null) {
            return profileNorm;
        }
        if (authNorm != null) {
            return authNorm;
        }
        return "APRENDIZ";
    }

    private void syncRoleAcrossTables(UserAuth user, UserRegisterProfile profile, String effectiveRole) {
        if (!effectiveRole.equals(profile.getNameRole())) {
            profile.setNameRole(effectiveRole);
            userRegisterProfileRepository.save(profile);
        }

        roleRepository.findByNameRoleIgnoreCase(effectiveRole).ifPresent(roleEntity -> {
            if (user.getRole() == null || !roleEntity.getId().equals(user.getRole().getId())) {
                user.setRole(roleEntity);
                userAuthRepository.save(user);
            }
        });
    }

    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
