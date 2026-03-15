package com.proyect.MyAccess.service;

import com.proyect.MyAccess.dto.UserLoginRequestDTO;
import com.proyect.MyAccess.entity.UserRegisterProfile;
import com.proyect.MyAccess.repository.UserRegisterProfileRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRegisterProfileRepository userRepository;
    private final JwtService jwtService;

    @Autowired
    public AuthService(UserRegisterProfileRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    // ========== LOGIN CORREGIDO ==========
    @Transactional(readOnly = true)
    public String login(UserLoginRequestDTO request) {
        System.out.println("\n========== DEBUG LOGIN ==========");

        // Verificar si el DTO llegó bien
        if (request == null) {
            System.out.println("ERROR: request es NULL");
            throw new RuntimeException("Request vacío");
        }

        System.out.println("Email en DTO: '" + request.getEmail() + "'");
        System.out.println("Password en DTO: '" + request.getPassword() + "'");

        // Validar que no sean null
        if (request.getEmail() == null || request.getPassword() == null) {
            System.out.println("ERROR: email o password son NULL");
            throw new RuntimeException("Email y password son obligatorios");
        }

        // Limpiar email
        String email = request.getEmail().trim().toLowerCase();
        System.out.println("Email limpio: '" + email + "'");

        // Buscar usuario
        UserRegisterProfile user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    System.out.println("ERROR: Usuario no encontrado con email: " + email);
                    return new RuntimeException("Usuario no encontrado");
                });

        System.out.println("Usuario encontrado ID: " + user.getId());

        // Verificar password
        boolean passwordMatch = BCrypt.checkpw(request.getPassword(), user.getPassword());
        System.out.println("Password match: " + passwordMatch);

        if (!passwordMatch) {
            throw new RuntimeException("Credenciales incorrectas");
        }

        System.out.println("========== LOGIN EXITOSO ==========\n");

        // Generar token
        return jwtService.generateToken(user.getId(), user.getEmail(), user.getId());
    }

    // ========== REGISTER (si lo necesitas) ==========
    @Transactional
    public String register(com.proyect.MyAccess.dto.UserRegisterProfileRequestDTO request) {
        // Verificar si email existe
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        // Crear usuario
        UserRegisterProfile user = new UserRegisterProfile();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt()));

        // Guardar
        userRepository.save(user);

        // Generar token
        return jwtService.generateToken(user.getId(), user.getEmail(), user.getId());
    }
}