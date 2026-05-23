package com.proyect.user_service.service;

import com.proyect.auth_service.entity.UserAuth;
import com.proyect.auth_service.repository.UserAuthRepository;
import com.proyect.user_service.dto.AuthResponseDTO;
import com.proyect.user_service.dto.UserLoginRequestDTO;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserLoginService {

    private final UserAuthRepository userAuthRepository;
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

        Long userId = jwtService.extractUserId(refreshToken);
        UserAuth user = userAuthRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!user.getVerifiedEmail()) {
            throw new RuntimeException("cuenta no verificada. revisa tu correo");
        }

        return generateAuthResponse(user);
    }

    private AuthResponseDTO generateAuthResponse(UserAuth user) {
        String nameRole = user.getRole() != null ? user.getRole().getNameRole() : "";
        String token = jwtService.generateToken(user.getId(), user.getEmail(), nameRole);
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail(), nameRole);
        return new AuthResponseDTO(token, refreshToken);
    }
}
