package com.proyect.MyAccess.notifications_service.controller;

import com.proyect.MyAccess.notifications_service.dto.QueueNotificationRequestDTO;
import com.proyect.MyAccess.notifications_service.dto.QueueNotificationResponseDTO;
import com.proyect.MyAccess.notifications_service.service.QueueNotificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notificationsService/queue")
public class QueueNotificationController {

    private final QueueNotificationService queueNotificationService;

    @PostMapping
    public ResponseEntity<QueueNotificationResponseDTO> create(@RequestBody QueueNotificationRequestDTO dto, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(queueNotificationService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<QueueNotificationResponseDTO>> getAll(HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(queueNotificationService.getAll());
    }

    @GetMapping("/chanel/{chanel}")
    public ResponseEntity<List<QueueNotificationResponseDTO>> getByChanel(@PathVariable String chanel, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(queueNotificationService.getByChanel(chanel));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return queueNotificationService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
