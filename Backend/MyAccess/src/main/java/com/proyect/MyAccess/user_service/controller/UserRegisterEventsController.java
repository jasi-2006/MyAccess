package com.proyect.MyAccess.user_service.controller;

import com.proyect.MyAccess.user_service.dto.UserRegisterEventsRequestsDTO;
import com.proyect.MyAccess.user_service.dto.UserRegisterEventsResponseDTO;
import com.proyect.MyAccess.user_service.service.UserRegisterEventsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController
@RequestMapping("/registerEvents")
@RequiredArgsConstructor
public class UserRegisterEventsController {
    private final UserRegisterEventsService userEventsService;

    @PostMapping
    public ResponseEntity<UserRegisterEventsResponseDTO> create(@RequestBody UserRegisterEventsRequestsDTO dto, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        UserRegisterEventsResponseDTO response = userEventsService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<UserRegisterEventsResponseDTO>> getAll(HttpServletRequest request) {
       String role  =(String) request.getAttribute("role");
       Long userId = (Long) request.getAttribute("userId");
       if("APRENDIZ".equals(role)){
           return  ResponseEntity.ok(userEventsService.getByUserId((userId)));
       }
       return  ResponseEntity.ok(userEventsService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserRegisterEventsResponseDTO> getById(
            @PathVariable Long id, HttpServletRequest request) {

        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");

        UserRegisterEventsResponseDTO response = userEventsService.getById(id);

        if ("APRENDIZ".equalsIgnoreCase(role) && !response.getIdUser().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserRegisterEventsResponseDTO> update(
            @PathVariable Long id,
            @RequestBody UserRegisterEventsRequestsDTO dto,
            HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        UserRegisterEventsResponseDTO response = userEventsService.update(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        userEventsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
