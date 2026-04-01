package com.proyect.MyAccess.user_service.service;

import com.proyect.MyAccess.auth_service.dto.AuditRequestDTO;
import com.proyect.MyAccess.user_service.dto.UserLoginRequestDTO;
import com.proyect.MyAccess.user_service.entity.UserRegisterProfile;
import com.proyect.MyAccess.user_service.repository.UserRegisterProfileRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserLoginService {

    private final UserRegisterProfileRepository userRepository;
    private final JwtService jwtService;

    @Autowired
    public UserLoginService(UserRegisterProfileRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public String login(UserLoginRequestDTO request) {
        UserRegisterProfile user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!BCrypt.checkpw(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Credenciales incorrectas");
        }
        if (!user.getVerified()){
            throw new RuntimeException("cuenta no verificada. revisa tu correo");
        }

        return jwtService.generateToken(user.getId(), user.getEmail(), user.getNameRole());
    }
}