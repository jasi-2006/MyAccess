package com.proyect.MyAccess.service;

import com.proyect.MyAccess.dto.UserLoginRequestDTO;
import com.proyect.MyAccess.entity.UserRegisterProfile;
import com.proyect.MyAccess.repository.UserRegisterProfileRepository;
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
        System.out.println("Email recibido: " + request.getEmail());
        System.out.println("Password recibido: " + request.getPassword());

        UserRegisterProfile user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!BCrypt.checkpw(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Credenciales incorrectas");
        }

        return jwtService.generateToken(user.getId(), user.getEmail(), 1L);
    }
}
