package com.proyect.card_service.controller;

import com.proyect.card_service.dto.RequestCardRequestDTO;
import com.proyect.card_service.dto.RequestCardResponseDTO;
import com.proyect.card_service.service.RequestCardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
 * Controlador REST para la gestión de solicitudes de carnet.
 * Expone endpoints para crear y consultar solicitudes de emisión o reimpresión.
 * Los APRENDIZ solo pueden ver sus propias solicitudes.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/cardService/requests")
public class RequestCardController {

    private final RequestCardService requestCardService;

    /*
     * Crea una nueva solicitud de carnet.
     * @param dto Datos de la solicitud a crear
     * @return ResponseEntity con la solicitud creada y estado 201 Created
     */
    @PostMapping
    public ResponseEntity<RequestCardResponseDTO> create(@RequestBody RequestCardRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requestCardService.create(dto));
    }

    /*
     * Retorna todas las solicitudes. Si el rol es APRENDIZ, solo devuelve las propias.
     * @param request Solicitud HTTP con atributos de autenticación (role, userId)
     * @return ResponseEntity con la lista de solicitudes y estado 200 OK
     */
    @GetMapping
    public ResponseEntity<List<RequestCardResponseDTO>> getAll(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");
        if ("APRENDIZ".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(requestCardService.getByUser(userId.intValue()));
        }
        return ResponseEntity.ok(requestCardService.getAll());
    }

    /*
     * Busca solicitudes por usuario. APRENDIZ solo puede ver las suyas.
     * @param idUser Identificador del usuario a consultar
     * @param request Solicitud HTTP con atributos de autenticación (role, userId)
     * @return ResponseEntity con la lista de solicitudes, 403 si APRENDIZ intenta ver las de otro
     */
    @GetMapping("/user/{idUser}")
    public ResponseEntity<List<RequestCardResponseDTO>> getByUser(@PathVariable Integer idUser, HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");
        if ("APRENDIZ".equalsIgnoreCase(role) && !userId.equals(idUser.longValue())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(requestCardService.getByUser(idUser));
    }

    /*
     * Filtra solicitudes por estado. Solo ADMIN e INSTRUCTOR pueden acceder.
     * @param state Estado de la solicitud a filtrar
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con la lista filtrada, 403 si es APRENDIZ
     */
    @GetMapping("/state/{state}")
    public ResponseEntity<List<RequestCardResponseDTO>> getByState(@PathVariable String state, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(requestCardService.getByState(state));
    }

    /*
     * Actualiza una solicitud existente por su ID. Solo ADMIN e INSTRUCTOR pueden actualizar.
     * @param id Identificador de la solicitud a actualizar
     * @param dto Nuevos datos de la solicitud
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con la solicitud actualizada, 403 si es APRENDIZ, 404 si no existe
     */
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
