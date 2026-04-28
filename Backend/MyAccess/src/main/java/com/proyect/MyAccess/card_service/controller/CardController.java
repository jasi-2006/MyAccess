package com.proyect.MyAccess.card_service.controller;

import com.proyect.MyAccess.card_service.dto.CardRequestDTO;
import com.proyect.MyAccess.card_service.dto.CardResponseDTO;
import com.proyect.MyAccess.card_service.service.CardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
 * Controlador REST para la gestión de carnets.
 * Expone endpoints para crear, consultar, actualizar y eliminar carnets.
 * Los APRENDIZ solo pueden consultar sus propios carnets.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/cardService/cards")
public class CardController {

    private final CardService cardService;

    /*
     * Crea un nuevo carnet. Solo ADMIN e INSTRUCTOR pueden crear carnets.
     * @param dto Datos del carnet a crear
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con el carnet creado y estado 201 Created, 403 si es APRENDIZ
     */
    @PostMapping
    public ResponseEntity<CardResponseDTO> create(@RequestBody CardRequestDTO dto, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(cardService.create(dto));
    }

    /*
     * Retorna todos los carnets. Si el rol es APRENDIZ, solo devuelve los propios.
     * @param request Solicitud HTTP con atributos de autenticación (role, userId)
     * @return ResponseEntity con la lista de carnets y estado 200 OK
     */
    @GetMapping
    public ResponseEntity<List<CardResponseDTO>> getAll(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");
        if ("APRENDIZ".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(cardService.getByUser(userId.intValue()));
        }
        return ResponseEntity.ok(cardService.getAll());
    }

    /*
     * Busca carnets por usuario. APRENDIZ solo puede ver los suyos.
     * @param idUser Identificador del usuario a consultar
     * @param request Solicitud HTTP con atributos de autenticación (role, userId)
     * @return ResponseEntity con la lista de carnets, 403 si APRENDIZ intenta ver los de otro
     */
    @GetMapping("/user/{idUser}")
    public ResponseEntity<List<CardResponseDTO>> getByUser(@PathVariable Integer idUser, HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");
        if ("APRENDIZ".equalsIgnoreCase(role) && !userId.equals(idUser.longValue())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(cardService.getByUser(idUser));
    }

    /*
     * Actualiza un carnet existente por su ID. Solo ADMIN e INSTRUCTOR pueden actualizar.
     * @param id Identificador del carnet a actualizar
     * @param dto Nuevos datos del carnet
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con el carnet actualizado, 403 si es APRENDIZ, 404 si no existe
     */
    @PutMapping("/{id}")
    public ResponseEntity<CardResponseDTO> update(@PathVariable Long id, @RequestBody CardRequestDTO dto, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return cardService.update(id, dto)
                .map(r -> ResponseEntity.status(HttpStatus.ACCEPTED).body(r))
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * Elimina un carnet por su ID. Solo ADMIN e INSTRUCTOR pueden eliminar.
     * @param id Identificador del carnet a eliminar
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity 204 No Content si se eliminó, 403 si es APRENDIZ, 404 si no existía
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return cardService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
