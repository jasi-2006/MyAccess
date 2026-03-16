package com.proyect.MyAccess.controller;

import com.proyect.MyAccess.dto.AuthResponseDTO;
import com.proyect.MyAccess.dto.UserLoginRequestDTO;
import com.proyect.MyAccess.dto.UserRegisterProfileRequestDTO;
import com.proyect.MyAccess.service.AuthService;
import com.proyect.MyAccess.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegisterProfileRequestDTO request) {
        try {
            String token = authService.register(request);
            return ResponseEntity.ok(new AuthResponseDTO(token));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginRequestDTO request) {
        System.out.println("Controller recibió email: '" + request.getEmail() + "'");

        try {
            String token = authService.login(request);
            return ResponseEntity.ok(new AuthResponseDTO(token));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
