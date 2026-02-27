package com.proyect.MyAccess.controller;

import com.proyect.MyAccess.dto.RoleRequestDTO;
import com.proyect.MyAccess.dto.RoleResponseDTO;
import com.proyect.MyAccess.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/role")
public class RoleController {
    private final RoleService roleService;

    @PostMapping("/roles")
    public ResponseEntity<RoleResponseDTO> created(@RequestBody RoleRequestDTO roleRequestDTO){
        RoleResponseDTO response =roleService.roleCreated(roleRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);

    }
    @GetMapping("/roles/{role}")
    public ResponseEntity<RoleResponseDTO>getForNamerol(@PathVariable String role){
        RoleResponseDTO response = roleService.getForName(role );
        return ResponseEntity.ok(response);
    }


}
