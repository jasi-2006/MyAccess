package com.proyect.user_service.service;

import com.proyect.auth_service.entity.UserAuth;
import com.proyect.auth_service.repository.UserAuthRepository;
import com.proyect.user_service.dto.AuthResponseDTO;
import com.proyect.user_service.dto.UserLoginRequestDTO;
import com.proyect.user_service.entity.UserRegisterProfile;
import com.proyect.user_service.repository.UserRegisterProfileRepository;
import com.proyect.user_service.util.RoleNameNormalizer;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserLoginService {

    private final UserAuthRepository userAuthRepository;
    private final UserRegisterProfileRepository userRegisterProfileRepository;
    private final JwtService jwtService;

    /**
     * metodo para la el inicio de sesion del usuario con verificacionde la identidad del usuario
     * @param request  recibe los datos del usuario
     * */
    public AuthResponseDTO login(UserLoginRequestDTO request) {
        UserAuth user = userAuthRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!BCrypt.checkpw(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Credenciales incorrectas");
        }
        if (!user.getVerifiedEmail()) {
            throw new RuntimeException("cuenta no verificada. revisa tu correo");
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

        UserAuth user = userAuthRepository.findByEmail(profile.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!user.getVerifiedEmail()) {
            throw new RuntimeException("cuenta no verificada. revisa tu correo");
        }

        return generateAuthResponse(user, profile);
    }

    private AuthResponseDTO generateAuthResponse(UserAuth user) {
        UserRegisterProfile profile = userRegisterProfileRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("El usuario no tiene perfil configurado"));
        return generateAuthResponse(user, profile);
    }

    private AuthResponseDTO generateAuthResponse(UserAuth user, UserRegisterProfile profile) {
        String nameRole = RoleNameNormalizer.normalize(profile.getNameRole());
        if (nameRole == null || nameRole.isBlank()) {
            throw new RuntimeException("El usuario no tiene un rol configurado en su perfil");
        }

        // userId del JWT = id del perfil (user_profile), usado por card/notifications.
        Long profileId = profile.getId();
        String token = jwtService.generateToken(profileId, user.getEmail(), nameRole);
        String refreshToken = jwtService.generateRefreshToken(profileId, user.getEmail(), nameRole);
        return new AuthResponseDTO(token, refreshToken);
    }
}
