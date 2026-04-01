package com.proyect.MyAccess.news_service.controller;

import com.proyect.MyAccess.news_service.dto.KindNoventlyRequestDTO;
import com.proyect.MyAccess.news_service.dto.KindNoventlyResponseDTO;
import com.proyect.MyAccess.news_service.service.KindNoventlyService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/newsService/kindNovently")
public class KindNoventlyController {

    private final KindNoventlyService kindNoventlyService;

    @PostMapping
    public ResponseEntity<KindNoventlyResponseDTO> create(@RequestBody KindNoventlyRequestDTO dto, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(kindNoventlyService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<KindNoventlyResponseDTO>> getAll() {
        return ResponseEntity.ok(kindNoventlyService.getAll());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<KindNoventlyResponseDTO>> getActivos() {
        return ResponseEntity.ok(kindNoventlyService.getActivos());
    }

    @PutMapping("/{id}")
    public ResponseEntity<KindNoventlyResponseDTO> update(@PathVariable Long id, @RequestBody KindNoventlyRequestDTO dto, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return kindNoventlyService.update(id, dto)
                .map(r -> ResponseEntity.status(HttpStatus.ACCEPTED).body(r))
                .orElse(ResponseEntity.notFound().build());
    }
}
