package com.proyect.MyAccess.news_service.controller;

import com.proyect.MyAccess.news_service.dto.NoventlyRequestDTO;
import com.proyect.MyAccess.news_service.dto.NoventlyResponseDTO;
import com.proyect.MyAccess.news_service.service.NoventlyService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/newsService/noventlies")
public class NoventlyController {

    private final NoventlyService noventlyService;

    @PostMapping
    public ResponseEntity<NoventlyResponseDTO> create(@RequestBody NoventlyRequestDTO dto, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(noventlyService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<NoventlyResponseDTO>> getAll(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");
        if ("APRENDIZ".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(noventlyService.getByUser(userId.intValue()));
        }
        return ResponseEntity.ok(noventlyService.getAll());
    }

    @GetMapping("/user/{idUser}")
    public ResponseEntity<List<NoventlyResponseDTO>> getByUser(@PathVariable Integer idUser, HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");
        if ("APRENDIZ".equalsIgnoreCase(role) && !userId.equals(idUser.longValue())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(noventlyService.getByUser(idUser));
    }

    @GetMapping("/state/{stated}")
    public ResponseEntity<List<NoventlyResponseDTO>> getByStated(@PathVariable String stated, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(noventlyService.getByStated(stated));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoventlyResponseDTO> update(@PathVariable Long id, @RequestBody NoventlyRequestDTO dto, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return noventlyService.update(id, dto)
                .map(r -> ResponseEntity.status(HttpStatus.ACCEPTED).body(r))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return noventlyService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
