package com.proyect.MyAccess.auth_service.controller;

import com.proyect.MyAccess.auth_service.dto.PermissionRequestDTO;
import com.proyect.MyAccess.auth_service.dto.PermissionResponseDTO;
import com.proyect.MyAccess.auth_service.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequiredArgsConstructor
@RequestMapping("/register")
public class PermissionController {
    public  final PermissionService permissionService;

    @PostMapping("/permissions")
    public ResponseEntity<PermissionResponseDTO> permission(@RequestBody PermissionRequestDTO requestDTO){
        PermissionResponseDTO response = permissionService.create (requestDTO);
         return  ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
