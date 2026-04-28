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

/*
 * Controlador REST para la gestión de la cola de notificaciones.
 * Expone endpoints para encolar, consultar y eliminar notificaciones pendientes.
 * Solo ADMIN e INSTRUCTOR pueden acceder a estos endpoints.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/notificationsService/queue")
public class QueueNotificationController {

    private final QueueNotificationService queueNotificationService;

    /*
     * Agrega una notificación a la cola de envío. Solo ADMIN e INSTRUCTOR pueden agregar.
     * @param dto Datos del elemento de cola a crear
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con el elemento creado y estado 201 Created, 403 si es APRENDIZ
     */
    @PostMapping
    public ResponseEntity<QueueNotificationResponseDTO> create(@RequestBody QueueNotificationRequestDTO dto, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(queueNotificationService.create(dto));
    }

    /*
     * Retorna toda la cola ordenada por prioridad ascendente. Solo ADMIN e INSTRUCTOR pueden acceder.
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con la lista de la cola y estado 200 OK, 403 si es APRENDIZ
     */
    @GetMapping
    public ResponseEntity<List<QueueNotificationResponseDTO>> getAll(HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(queueNotificationService.getAll());
    }

    /*
     * Filtra la cola por canal de envío. Solo ADMIN e INSTRUCTOR pueden acceder.
     * @param chanel Canal de envío a filtrar (ej: EMAIL, SMS)
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con la lista filtrada, 403 si es APRENDIZ
     */
    @GetMapping("/chanel/{chanel}")
    public ResponseEntity<List<QueueNotificationResponseDTO>> getByChanel(@PathVariable String chanel, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(queueNotificationService.getByChanel(chanel));
    }

    /*
     * Elimina un elemento de la cola por su ID. Solo ADMIN e INSTRUCTOR pueden eliminar.
     * @param id Identificador del elemento a eliminar
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity 204 No Content si se eliminó, 403 si es APRENDIZ, 404 si no existía
     */
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
