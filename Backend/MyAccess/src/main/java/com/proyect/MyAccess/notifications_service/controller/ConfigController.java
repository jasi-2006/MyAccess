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

/*
 * Controlador REST para la gestión de configuraciones del sistema de notificaciones.
 * Todos los endpoints son exclusivos para el rol ADMIN.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/notificationsService/config")
public class ConfigController {

    private final ConfigService configService;

    /*
     * Crea una nueva configuración. Solo ADMIN puede acceder.
     * @param dto Datos de la configuración a crear
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con la configuración creada y estado 201 Created, 403 si no es ADMIN
     */
    @PostMapping
    public ResponseEntity<ConfigResponseDTO> create(@RequestBody ConfigRequestDTO dto, HttpServletRequest request) {
        if (!"ADMIN".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(configService.create(dto));
    }

    /*
     * Retorna todas las configuraciones registradas. Solo ADMIN puede acceder.
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con la lista de configuraciones y estado 200 OK, 403 si no es ADMIN
     */
    @GetMapping
    public ResponseEntity<List<ConfigResponseDTO>> getAll(HttpServletRequest request) {
        if (!"ADMIN".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(configService.getAll());
    }

    /*
     * Busca una configuración por su clave única. Solo ADMIN puede acceder.
     * @param clue Clave de la configuración a buscar
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con la configuración encontrada, 403 si no es ADMIN, 404 si no existe
     */
    @GetMapping("/clue/{clue}")
    public ResponseEntity<ConfigResponseDTO> getByClue(@PathVariable String clue, HttpServletRequest request) {
        if (!"ADMIN".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return configService.getByClue(clue)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * Actualiza una configuración por su ID. Solo ADMIN puede actualizar.
     * @param id Identificador de la configuración a actualizar
     * @param dto Nuevos datos de la configuración
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con la configuración actualizada, 403 si no es ADMIN, 404 si no existe
     */
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
