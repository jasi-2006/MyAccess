package com.proyect.MyAccess.auth_service.controller;

import com.proyect.MyAccess.auth_service.dto.RoleRequestDTO;
import com.proyect.MyAccess.auth_service.dto.RoleResponseDTO;
import com.proyect.MyAccess.auth_service.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/role")
public class RoleController {
    public final RoleService roleService;
    @PostMapping("/user")
    public ResponseEntity<RoleResponseDTO>create(@RequestBody RoleRequestDTO requestDTO){
        RoleResponseDTO responseDTO= roleService.create(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }
}
