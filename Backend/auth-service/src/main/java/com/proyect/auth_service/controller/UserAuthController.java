package com.proyect.auth_service.controller;

import com.proyect.auth_service.dto.UserAuthRequestDTO;
import com.proyect.auth_service.dto.UserAuthResponseDTO;
import com.proyect.auth_service.service.UserAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/*
 * Controlador REST para la gestión de credenciales de autenticación.
 * Expone endpoints para crear cuentas de acceso al sistema.
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/authService")
public class UserAuthController {

    private final UserAuthService userAuthService;

    /*
     * Crea las credenciales de autenticación para un nuevo usuario.
     * Si no se envía idRole, asigna el rol APRENDIZ por defecto.
     * @param dto Datos de autenticación: email, password e idRole opcional
     * @return ResponseEntity con las credenciales creadas y estado 201 Created
     */
    @PostMapping("/users")
    public ResponseEntity<UserAuthResponseDTO> create(@RequestBody UserAuthRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userAuthService.create(dto));
    }
}
