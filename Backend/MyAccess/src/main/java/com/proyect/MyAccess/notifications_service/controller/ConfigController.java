package com.proyect.MyAccess.notifications_service.controller;

import com.proyect.MyAccess.notifications_service.dto.ConfigRequestDTO;
import com.proyect.MyAccess.notifications_service.dto.ConfigResponseDTO;
import com.proyect.MyAccess.notifications_service.service.ConfigService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notificationsService/config")
public class ConfigController {

    private final ConfigService configService;

    @PostMapping
    public ResponseEntity<ConfigResponseDTO> create(@RequestBody ConfigRequestDTO dto, HttpServletRequest request) {
        if (!"ADMIN".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(configService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<ConfigResponseDTO>> getAll(HttpServletRequest request) {
        if (!"ADMIN".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(configService.getAll());
    }

    @GetMapping("/clue/{clue}")
    public ResponseEntity<ConfigResponseDTO> getByClue(@PathVariable String clue, HttpServletRequest request) {
        if (!"ADMIN".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return configService.getByClue(clue)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConfigResponseDTO> update(@PathVariable Long id, @RequestBody ConfigRequestDTO dto, HttpServletRequest request) {
        if (!"ADMIN".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return configService.update(id, dto)
                .map(r -> ResponseEntity.status(HttpStatus.ACCEPTED).body(r))
                .orElse(ResponseEntity.notFound().build());
    }
}
