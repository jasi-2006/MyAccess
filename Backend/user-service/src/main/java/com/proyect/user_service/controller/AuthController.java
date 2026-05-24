package com.proyect.user_service.controller;

import com.proyect.auth_service.dto.UserAuthRequestDTO;
import com.proyect.auth_service.dto.UserAuthResponseDTO;
import com.proyect.auth_service.service.UserAuthService;
import com.proyect.user_service.dto.AuthResponseDTO;
import com.proyect.user_service.dto.RefreshTokenRequestDTO;
import com.proyect.user_service.dto.ResetPasswordRequestDTO;
import com.proyect.user_service.dto.RegisterRequestDTO;
import com.proyect.user_service.dto.UserLoginRequestDTO;
import com.proyect.user_service.dto.UserRegisterProfileRequestDTO;
import com.proyect.user_service.dto.UserRegisterProfileResponseDTO;
import com.proyect.user_service.service.UserLoginService;
import com.proyect.user_service.service.UserRegisterProfileService;
import com.proyect.user_service.service.VerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


/*
 * cotrolador rest para la gestion del inicio de sesion del usuario
 * expone enpoint para el inicio de sesion, recuperacion de contraseña, validacion del correo
 */

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserLoginService userLoginService;
    private final UserRegisterProfileService userRegisterProfileService;
    private final UserAuthService userAuthService;
    private final VerificationService verificationService;
    

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody UserLoginRequestDTO request) {
        return ResponseEntity.ok(userLoginService.login(request));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponseDTO> refreshToken(@RequestBody RefreshTokenRequestDTO request) {
        return ResponseEntity.ok(userLoginService.refreshToken(request.getRefreshToken()));
    }

    @PostMapping("/register")
    public ResponseEntity<UserRegisterProfileResponseDTO> register(@RequestBody RegisterRequestDTO request) {
        String email = request.getEmail() == null ? null : request.getEmail().trim().toLowerCase();
        request.setEmail(email);
        userRegisterProfileService.validateRegistrationAvailable(email, request.getDocument());

        UserAuthRequestDTO authDTO = new UserAuthRequestDTO();
        authDTO.setEmail(email);
        authDTO.setPassword(request.getPassword());
        userAuthService.create(authDTO);

        UserRegisterProfileRequestDTO profileDTO = new UserRegisterProfileRequestDTO();
        profileDTO.setDocument(request.getDocument());
        profileDTO.setTypeDocument(request.getTypeDocument());
        profileDTO.setFullName(request.getFullName());
        profileDTO.setTrainingProgram(request.getTrainingProgram());
        profileDTO.setTrainingCenter(request.getTrainingCenter());
        profileDTO.setRegional(request.getRegional());
        profileDTO.setBloodType(request.getBloodType());
        profileDTO.setNameRole(request.getNameRole());
        profileDTO.setFicha(request.getFicha());
        profileDTO.setEmail(email);
        UserRegisterProfileResponseDTO profileResponse = userRegisterProfileService.userCreated(profileDTO);

        try {
            verificationService.sendCode(email);
        } catch (Exception ex) {
            log.error("Failed to send verification code for {}", email, ex);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(profileResponse);
    }

    @PostMapping("/resend")
    public ResponseEntity<String> resend(@RequestParam String email) {
        verificationService.sendCode(email);
        return ResponseEntity.ok("codigo reenviado al correo");
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verify(@RequestParam String email, @RequestParam String code) {
        verificationService.VerifiCode(email, code);
        return ResponseEntity.ok("cuenta verificada correctamente");
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

    @PostMapping(value = "/photo/{document}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserRegisterProfileResponseDTO> uploadPhoto(
            @PathVariable String document,
            @RequestParam("photo") MultipartFile photo) {
        try {
            return userRegisterProfileService.uploadPhoto(document, photo)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
