package com.proyect.MyAccess.user_service.controller;

import com.proyect.MyAccess.user_service.dto.UserRegisterEventsRequestsDTO;
import com.proyect.MyAccess.user_service.dto.UserRegisterEventsResponseDTO;
import com.proyect.MyAccess.user_service.service.UserRegisterEventsService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
 * Controlador REST para la gestión de eventos de registro de usuarios.
 * Expone endpoints para crear, consultar, actualizar y eliminar eventos.
 * Los APRENDIZ solo pueden consultar sus propios eventos.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/registerEvents")
public class UserRegisterEventsController {

    private final UserRegisterEventsService userEventsService;

    /*
     * Crea un nuevo evento de registro. Solo ADMIN e INSTRUCTOR pueden crear.
     * @param dto Datos del evento a crear
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con el evento creado y estado 201 Created, 403 si es APRENDIZ
     */
    @PostMapping
    public ResponseEntity<UserRegisterEventsResponseDTO> create(@RequestBody UserRegisterEventsRequestsDTO dto, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(userEventsService.create(dto));
    }

    /*
     * Retorna todos los eventos. Si el rol es APRENDIZ, solo devuelve los propios.
     * @param request Solicitud HTTP con atributos de autenticación (role, userId)
     * @return ResponseEntity con la lista de eventos y estado 200 OK
     */
    @GetMapping
    public ResponseEntity<List<UserRegisterEventsResponseDTO>> getAll(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");
        if ("APRENDIZ".equals(role)) {
            return ResponseEntity.ok(userEventsService.getByUserId(userId));
        }
        return ResponseEntity.ok(userEventsService.getAll());
    }

    /*
     * Busca un evento por su ID. APRENDIZ solo puede ver los suyos.
     * @param id Identificador del evento a buscar
     * @param request Solicitud HTTP con atributos de autenticación (role, userId)
     * @return ResponseEntity con el evento encontrado, 403 si APRENDIZ intenta ver el de otro
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserRegisterEventsResponseDTO> getById(@PathVariable Long id, HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");
        UserRegisterEventsResponseDTO response = userEventsService.getById(id);
        if ("APRENDIZ".equalsIgnoreCase(role) && !response.getIdUser().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(response);
    }

    /*
     * Actualiza un evento existente por su ID. Solo ADMIN e INSTRUCTOR pueden actualizar.
     * @param id Identificador del evento a actualizar
     * @param dto Nuevos datos del evento
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con el evento actualizado y estado 200 OK, 403 si es APRENDIZ
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserRegisterEventsResponseDTO> update(@PathVariable Long id, @RequestBody UserRegisterEventsRequestsDTO dto, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(userEventsService.update(id, dto));
    }

    /*
     * Elimina un evento por su ID. Solo ADMIN e INSTRUCTOR pueden eliminar.
     * @param id Identificador del evento a eliminar
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity 204 No Content si se eliminó, 403 si es APRENDIZ
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        userEventsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
