package com.proyect.MyAccess.card_service.controller;

import com.proyect.MyAccess.card_service.dto.RequestCardRequestDTO;
import com.proyect.MyAccess.card_service.dto.RequestCardResponseDTO;
import com.proyect.MyAccess.card_service.service.RequestCardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cardService/requests")
public class RequestCardController {

    private final RequestCardService requestCardService;

    @PostMapping
    public ResponseEntity<RequestCardResponseDTO> create(@RequestBody RequestCardRequestDTO dto, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requestCardService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<RequestCardResponseDTO>> getAll(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");
        if ("APRENDIZ".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(requestCardService.getByUser(userId.intValue()));
        }
        return ResponseEntity.ok(requestCardService.getAll());
    }

    @GetMapping("/user/{idUser}")
    public ResponseEntity<List<RequestCardResponseDTO>> getByUser(@PathVariable Integer idUser, HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");
        if ("APRENDIZ".equalsIgnoreCase(role) && !userId.equals(idUser.longValue())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(requestCardService.getByUser(idUser));
    }

    @GetMapping("/state/{state}")
    public ResponseEntity<List<RequestCardResponseDTO>> getByState(@PathVariable String state, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(requestCardService.getByState(state));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RequestCardResponseDTO> update(@PathVariable Long id, @RequestBody RequestCardRequestDTO dto, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return requestCardService.update(id, dto)
                .map(r -> ResponseEntity.status(HttpStatus.ACCEPTED).body(r))
                .orElse(ResponseEntity.notFound().build());
    }
}
