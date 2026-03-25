package com.proyect.MyAccess.controller;

import com.proyect.MyAccess.dto.AuthResponseDTO;
import com.proyect.MyAccess.service.UserRegisterProfileService;
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
    public ResponseEntity<AuthResponseDTO> login(@RequestBody com.proyect.MyAccess.dto.AuditRequestDTO request) {
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
}
