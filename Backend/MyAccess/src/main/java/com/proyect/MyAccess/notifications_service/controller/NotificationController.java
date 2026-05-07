package com.proyect.MyAccess.notifications_service.controller;

import com.proyect.MyAccess.notifications_service.dto.NotificationRequestDTO;
import com.proyect.MyAccess.notifications_service.dto.NotificationResponseDTO;
import com.proyect.MyAccess.notifications_service.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
 * Controlador REST para la gestión de notificaciones.
 * Expone endpoints para crear, consultar y actualizar notificaciones.
 * Los APRENDIZ solo pueden consultar sus propias notificaciones.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/notificationsService/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    /*
     * Crea una nueva notificación. Solo ADMIN e INSTRUCTOR pueden crear.
     * @param dto Datos de la notificación a crear
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con la notificación creada y estado 201 Created, 403 si es APRENDIZ
     */
    @PostMapping
    public ResponseEntity<NotificationResponseDTO> create(@RequestBody NotificationRequestDTO dto, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.create(dto));
    }

    /*
     * Retorna todas las notificaciones. Si el rol es APRENDIZ, solo devuelve las propias.
     * @param request Solicitud HTTP con atributos de autenticación (role, userId)
     * @return ResponseEntity con la lista de notificaciones y estado 200 OK
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getAll(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");
        if ("APRENDIZ".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(notificationService.getByUser(userId.intValue()));
        }
        return ResponseEntity.ok(notificationService.getAll());
    }

    /*
     * Busca notificaciones por usuario. APRENDIZ solo puede ver las suyas.
     * @param idUser Identificador del usuario a consultar
     * @param request Solicitud HTTP con atributos de autenticación (role, userId)
     * @return ResponseEntity con la lista de notificaciones, 403 si APRENDIZ intenta ver las de otro
     */
    @GetMapping("/user/{idUser}")
    public ResponseEntity<List<NotificationResponseDTO>> getByUser(@PathVariable Integer idUser, HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");
        if ("APRENDIZ".equalsIgnoreCase(role) && !userId.equals(idUser.longValue())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(notificationService.getByUser(idUser));
    }

    /*
     * Filtra notificaciones por estado de envío. Solo ADMIN e INSTRUCTOR pueden acceder.
     * @param statedSend Estado de envío a filtrar
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con la lista filtrada, 403 si es APRENDIZ
     */
    @GetMapping("/state/{statedSend}")
    public ResponseEntity<List<NotificationResponseDTO>> getByState(@PathVariable String statedSend, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(notificationService.getByState(statedSend));
    }

    /*
     * Actualiza una notificación existente por su ID. Solo ADMIN e INSTRUCTOR pueden actualizar.
     * @param id Identificador de la notificación a actualizar
     * @param dto Nuevos datos de la notificación
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con la notificación actualizada, 403 si es APRENDIZ, 404 si no existe
     */
    @PutMapping("/{id}")
    public ResponseEntity<NotificationResponseDTO> update(@PathVariable Long id, @RequestBody NotificationRequestDTO dto, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return notificationService.update(id, dto)
                .map(r -> ResponseEntity.status(HttpStatus.ACCEPTED).body(r))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(@PathVariable Long id, HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");

        try {
            return notificationService.markAsRead(id, userId, role)
                    .map(notification -> ResponseEntity.status(HttpStatus.ACCEPTED).body(notification))
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
}
