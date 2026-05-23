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

/*
 * Controlador REST para la gestión de novedades.
 * Expone endpoints para crear, consultar, actualizar y eliminar novedades.
 * Los APRENDIZ solo pueden consultar sus propias novedades.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/newsService/noventlies")
public class NoventlyController {

    private final NoventlyService noventlyService;

    /*
     * Crea una nueva novedad en el sistema.
     * @param dto Datos de la novedad a crear
     * @return ResponseEntity con la novedad creada y estado 201 Created
     */
    @PostMapping
    public ResponseEntity<NoventlyResponseDTO> create(@RequestBody NoventlyRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(noventlyService.create(dto));
    }

    /*
     * Retorna todas las novedades. Si el rol es APRENDIZ, solo devuelve las propias.
     * @param request Solicitud HTTP con atributos de autenticación (role, userId)
     * @return ResponseEntity con la lista de novedades y estado 200 OK
     */
    @GetMapping
    public ResponseEntity<List<NoventlyResponseDTO>> getAll(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");
        if ("APRENDIZ".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(noventlyService.getByUser(userId.intValue()));
        }
        return ResponseEntity.ok(noventlyService.getAll());
    }

    /*
     * Busca novedades por usuario. APRENDIZ solo puede ver las suyas.
     * @param idUser Identificador del usuario a consultar
     * @param request Solicitud HTTP con atributos de autenticación (role, userId)
     * @return ResponseEntity con la lista de novedades, 403 si APRENDIZ intenta ver las de otro
     */
    @GetMapping("/user/{idUser}")
    public ResponseEntity<List<NoventlyResponseDTO>> getByUser(@PathVariable Integer idUser, HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Long userId = (Long) request.getAttribute("userId");
        if ("APRENDIZ".equalsIgnoreCase(role) && !userId.equals(idUser.longValue())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(noventlyService.getByUser(idUser));
    }

    /*
     * Filtra novedades por estado. Solo ADMIN e INSTRUCTOR pueden acceder.
     * @param stated Estado de la novedad a filtrar
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con la lista filtrada, 403 si es APRENDIZ
     */
    @GetMapping("/state/{stated}")
    public ResponseEntity<List<NoventlyResponseDTO>> getByStated(@PathVariable String stated, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(noventlyService.getByStated(stated));
    }

    /*
     * Actualiza una novedad existente por su ID. Solo ADMIN e INSTRUCTOR pueden actualizar.
     * @param id Identificador de la novedad a actualizar
     * @param dto Nuevos datos de la novedad
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con la novedad actualizada, 403 si es APRENDIZ, 404 si no existe
     */
    @PutMapping("/{id}")
    public ResponseEntity<NoventlyResponseDTO> update(@PathVariable Long id, @RequestBody NoventlyRequestDTO dto, HttpServletRequest request) {
        if ("APRENDIZ".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return noventlyService.update(id, dto)
                .map(r -> ResponseEntity.status(HttpStatus.ACCEPTED).body(r))
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * Elimina una novedad por su ID. Solo ADMIN e INSTRUCTOR pueden eliminar.
     * @param id Identificador de la novedad a eliminar
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity 204 No Content si se eliminó, 403 si es APRENDIZ, 404 si no existía
     */
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
