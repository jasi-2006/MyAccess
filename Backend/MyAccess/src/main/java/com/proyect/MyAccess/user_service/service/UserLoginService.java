package com.proyect.MyAccess.user_service.service;

import com.proyect.MyAccess.auth_service.entity.UserAuth;
import com.proyect.MyAccess.auth_service.repository.UserAuthRepository;
import com.proyect.MyAccess.user_service.dto.UserLoginRequestDTO;
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
    public String login(UserLoginRequestDTO request) {
        UserAuth user = userAuthRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!BCrypt.checkpw(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Credenciales incorrectas");
        }
        if (!user.getVerifiedEmail()) {
            throw new RuntimeException("cuenta no verificada. revisa tu correo");
        }

        String nameRole = user.getRole() != null ? user.getRole().getNameRole() : "";
        return jwtService.generateToken(user.getId(), user.getEmail(), nameRole);
    }
}
