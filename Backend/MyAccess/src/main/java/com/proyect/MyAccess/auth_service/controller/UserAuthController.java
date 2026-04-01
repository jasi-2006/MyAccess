package com.proyect.MyAccess.auth_service.controller;

import com.proyect.MyAccess.auth_service.dto.UserAuthRequestDTO;
import com.proyect.MyAccess.auth_service.dto.UserAuthResponseDTO;
import com.proyect.MyAccess.auth_service.service.UserAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/authService")
public class UserAuthController {
    private final UserAuthService userAuthService;
    @PostMapping("/users")
    public ResponseEntity<UserAuthResponseDTO> create (@RequestBody UserAuthRequestDTO userAuthRequestDTO){
        UserAuthResponseDTO response= userAuthService.create(userAuthRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

}
