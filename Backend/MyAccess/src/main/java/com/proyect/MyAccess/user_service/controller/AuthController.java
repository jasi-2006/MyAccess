package com.proyect.MyAccess.user_service.controller;

import com.proyect.MyAccess.user_service.dto.AuthResponseDTO;
import com.proyect.MyAccess.user_service.dto.ResetPasswordRequestDTO;
import com.proyect.MyAccess.user_service.dto.UserLoginRequestDTO;
import com.proyect.MyAccess.user_service.dto.UserRegisterProfileRequestDTO;
import com.proyect.MyAccess.user_service.dto.UserRegisterProfileResponseDTO;
import com.proyect.MyAccess.user_service.service.UserLoginService;
import com.proyect.MyAccess.user_service.service.UserRegisterProfileService;
import com.proyect.MyAccess.user_service.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserLoginService userLoginService;
    private final UserRegisterProfileService userRegisterProfileService;
    private  final VerificationService verificationService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody UserLoginRequestDTO request) {
        String token = userLoginService.login(request);
        return ResponseEntity.ok(new AuthResponseDTO(token));
    }

    @PostMapping("/register")
    public ResponseEntity<UserRegisterProfileResponseDTO> register(@RequestBody UserRegisterProfileRequestDTO request) {
        UserRegisterProfileResponseDTO response = userRegisterProfileService.userCreated(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verify (@RequestParam String email, @RequestParam String code){
        verificationService.VerifiCode(email, code);
        return ResponseEntity.ok("cuenta verificada correctamente ");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        verificationService.sendPasswordResetCode(email);
        return ResponseEntity.ok("codigo enviado al correo");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        verificationService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
        return ResponseEntity.ok("contrasena actualizada correctamente");
    }
}
