package com.proyect.MyAccess.controller;

import com.proyect.MyAccess.dto.UserRegisterEventsRequestsDTO;
import com.proyect.MyAccess.dto.UserRegisterEventsResponseDTO;
import com.proyect.MyAccess.service.UserRegisterEventsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/RegisterEvents")
@RequiredArgsConstructor
public class UserRegisterEventsController {

    private final UserRegisterEventsService userEventsService;

    @PostMapping
    public ResponseEntity<UserRegisterEventsResponseDTO> create(@RequestBody UserRegisterEventsRequestsDTO dto) {
        UserRegisterEventsResponseDTO response = userEventsService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<UserRegisterEventsResponseDTO>> getAll() {
        List<UserRegisterEventsResponseDTO> response = userEventsService.getAll();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserRegisterEventsResponseDTO> getById(@PathVariable Long id) {
        UserRegisterEventsResponseDTO response = userEventsService.getById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserRegisterEventsResponseDTO> update(
            @PathVariable Long id,
            @RequestBody UserRegisterEventsRequestsDTO dto) {
        UserRegisterEventsResponseDTO response = userEventsService.update(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userEventsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
