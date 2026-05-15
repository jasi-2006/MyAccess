package com.proyect.MyAccess.user_service.controller;

import com.proyect.MyAccess.auth_service.dto.UserAuthRequestDTO;
import com.proyect.MyAccess.auth_service.dto.UserAuthResponseDTO;
import com.proyect.MyAccess.auth_service.service.UserAuthService;
import com.proyect.MyAccess.user_service.dto.AuthResponseDTO;
import com.proyect.MyAccess.user_service.dto.ResetPasswordRequestDTO;
import com.proyect.MyAccess.user_service.dto.RegisterRequestDTO;
import com.proyect.MyAccess.user_service.dto.UserLoginRequestDTO;
import com.proyect.MyAccess.user_service.dto.UserRegisterProfileRequestDTO;
import com.proyect.MyAccess.user_service.dto.UserRegisterProfileResponseDTO;
import com.proyect.MyAccess.user_service.service.UserLoginService;
import com.proyect.MyAccess.user_service.service.UserRegisterProfileService;
import com.proyect.MyAccess.user_service.service.VerificationService;
import lombok.RequiredArgsConstructor;
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
public class AuthController {

    private final UserLoginService userLoginService;
    private final UserRegisterProfileService userRegisterProfileService;
    private final UserAuthService userAuthService;
    private final VerificationService verificationService;
    

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody UserLoginRequestDTO request) {
        String token = userLoginService.login(request);
        return ResponseEntity.ok(new AuthResponseDTO(token));
    }

    @PostMapping("/register")
    public ResponseEntity<UserRegisterProfileResponseDTO> register(@RequestBody RegisterRequestDTO request) {
        UserAuthRequestDTO authDTO = new UserAuthRequestDTO();
        authDTO.setEmail(request.getEmail());
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
        profileDTO.setEmail(request.getEmail());
        UserRegisterProfileResponseDTO profileResponse = userRegisterProfileService.userCreated(profileDTO);

        verificationService.sendCode(request.getEmail());

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
