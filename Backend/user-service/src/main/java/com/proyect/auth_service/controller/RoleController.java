package com.proyect.auth_service.controller;

import com.proyect.auth_service.dto.RoleRequestDTO;
import com.proyect.auth_service.dto.RoleResponseDTO;
import com.proyect.auth_service.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
 * Controlador REST para la gestión de roles del sistema.
 * Expone endpoints para crear, consultar, actualizar y eliminar roles.
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/role")
public class RoleController {

    private final RoleService roleService;

    /*
     * Crea un nuevo rol en el sistema.
     * @param dto Datos del rol a crear
     * @return ResponseEntity con el rol creado y estado 201 Created
     */
    @PostMapping
    public ResponseEntity<RoleResponseDTO> create(@RequestBody RoleRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roleService.create(dto));
    }

    /*
     * Retorna todos los roles registrados en el sistema.
     * @return ResponseEntity con la lista de roles y estado 200 OK
     */
    @GetMapping
    public ResponseEntity<List<RoleResponseDTO>> getAll() {
        return ResponseEntity.ok(roleService.getAll());
    }

    /*
     * Actualiza un rol existente por su ID.
     * @param id Identificador del rol a actualizar
     * @param dto Nuevos datos del rol
     * @return ResponseEntity con el rol actualizado, 404 si no existe
     */
    @PutMapping("/{id}")
    public ResponseEntity<RoleResponseDTO> update(@PathVariable Long id, @RequestBody RoleRequestDTO dto) {
        return roleService.update(id, dto)
                .map(r -> ResponseEntity.status(HttpStatus.ACCEPTED).body(r))
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * Elimina un rol por su ID.
     * @param id Identificador del rol a eliminar
     * @return ResponseEntity 204 No Content si se eliminó, 404 si no existía
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return roleService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
