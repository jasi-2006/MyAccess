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

/*
 * Controlador REST para la gestión de tipos de novedad.
 * Expone endpoints para crear, consultar y actualizar categorías de novedades.
 * Solo ADMIN e INSTRUCTOR pueden crear o modificar tipos de novedad.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/newsService/kindNovently")
public class KindNoventlyController {

    private final KindNoventlyService kindNoventlyService;

    /*
     * Crea un nuevo tipo de novedad. Solo ADMIN e INSTRUCTOR pueden crear.
     * @param dto Datos del tipo de novedad a crear
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con el tipo creado y estado 201 Created, 403 si es APRENDIZ
     */
    @PostMapping
    public ResponseEntity<KindNoventlyResponseDTO> create(@RequestBody KindNoventlyRequestDTO dto, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(kindNoventlyService.create(dto));
    }

    /*
     * Retorna todos los tipos de novedad registrados en el sistema.
     * @return ResponseEntity con la lista de tipos y estado 200 OK
     */
    @GetMapping
    public ResponseEntity<List<KindNoventlyResponseDTO>> getAll() {
        return ResponseEntity.ok(kindNoventlyService.getAll());
    }

    /*
     * Retorna solo los tipos de novedad que están activos.
     * @return ResponseEntity con la lista de tipos activos y estado 200 OK
     */
    @GetMapping("/activos")
    public ResponseEntity<List<KindNoventlyResponseDTO>> getActivos() {
        return ResponseEntity.ok(kindNoventlyService.getActivos());
    }

    /*
     * Actualiza un tipo de novedad por su ID. Solo ADMIN e INSTRUCTOR pueden actualizar.
     * @param id Identificador del tipo de novedad a actualizar
     * @param dto Nuevos datos del tipo de novedad
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con el tipo actualizado, 403 si es APRENDIZ, 404 si no existe
     */
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
