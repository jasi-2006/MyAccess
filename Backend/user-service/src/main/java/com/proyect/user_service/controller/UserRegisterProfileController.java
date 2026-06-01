package com.proyect.user_service.controller;

import com.proyect.user_service.dto.UserRegisterProfileRequestDTO;
import com.proyect.user_service.dto.UserRegisterProfileResponseDTO;
import com.proyect.user_service.service.UserRegisterProfileService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/*
 * Controlador REST para la gestión de perfiles de usuario.
 * Expone endpoints para consultar, actualizar y eliminar perfiles.
 * Los APRENDIZ solo pueden actualizar su propio perfil.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/register")
public class UserRegisterProfileController {

    private final UserRegisterProfileService userService;

    /*
     * Retorna todos los perfiles de usuario registrados en el sistema.
     * @return ResponseEntity con la lista de perfiles y estado 200 OK
     */
    @GetMapping
    public ResponseEntity<List<UserRegisterProfileResponseDTO>> getAll() {
        return ResponseEntity.ok(userService.getUsuarios());
    }

    /*
     * Filtra perfiles por nombre de rol asignado.
     * @param nameRole Nombre del rol a filtrar
     * @return ResponseEntity con la lista de perfiles del rol indicado y estado 200 OK
     */
    @GetMapping("/role/{nameRole}")
    public ResponseEntity<List<UserRegisterProfileResponseDTO>> getByRole(@PathVariable String nameRole) {
        return ResponseEntity.ok(userService.getForNameRol(nameRole));
    }

    /*
     * Busca perfiles por número de documento.
     * @param document Número de documento a buscar
     * @return ResponseEntity con la lista de perfiles encontrados y estado 200 OK
     */
    @GetMapping("/users/{document}")
    public ResponseEntity<List<UserRegisterProfileResponseDTO>> getByDocument(@PathVariable String document) {
        return ResponseEntity.ok(userService.getForDocument(document));
    }

    @GetMapping("/profile/me")
    public ResponseEntity<UserRegisterProfileResponseDTO> getMyProfile(HttpServletRequest request) {
        String email = (String) request.getAttribute("emailId");
        if (email == null || email.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return userService.getByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /*
     * Actualiza un perfil por su ID. Solo ADMIN puede actualizar por ID.
     * @param id Identificador del perfil a actualizar
     * @param dto Nuevos datos del perfil
     * @param request Solicitud HTTP con atributos de autenticación (role)
     * @return ResponseEntity con el perfil actualizado, 403 si no es ADMIN, 404 si no existe
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<UserRegisterProfileResponseDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UserRegisterProfileRequestDTO dto,
            HttpServletRequest request) {
        if (!"ADMIN".equalsIgnoreCase((String) request.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return userService.updateUser(id, dto)
                .map(r -> ResponseEntity.status(HttpStatus.ACCEPTED).body(r))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /*
     * Actualiza un perfil buscándolo por documento. APRENDIZ solo puede actualizar el suyo.
     * @param document Número de documento del perfil a actualizar
     * @param dto Nuevos datos del perfil
     * @param request Solicitud HTTP con atributos de autenticación (role, userId)
     * @return ResponseEntity con el perfil actualizado, 403 si APRENDIZ intenta editar otro, 404 si no existe
     */
    @PutMapping("/users/document/{document}")
    public ResponseEntity<UserRegisterProfileResponseDTO> updateByDocument(
            @PathVariable String document,
            @RequestBody UserRegisterProfileRequestDTO dto,
            HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        String email = (String) request.getAttribute("emailId");
        if ("APRENDIZ".equalsIgnoreCase(role)) {
            List<UserRegisterProfileResponseDTO> user = userService.getForDocument(document);
            if (user.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            String profileEmail = user.get(0).getEmail();
            if (profileEmail == null || email == null
                    || !profileEmail.equalsIgnoreCase(email.trim())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        return userService.updateUserForDocument(document, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /*
     * Elimina un perfil por documento. Solo ADMIN puede eliminar.
     * @param document Número de documento del perfil a eliminar
     * @return ResponseEntity 204 No Content si se eliminó, 404 si no existía
     */
    @PostMapping(value = "/users/photo/{document}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserRegisterProfileResponseDTO> uploadPhoto(
            @PathVariable String document,
            @RequestParam("photo") MultipartFile photo,
            HttpServletRequest request) throws IOException {
        String role = (String) request.getAttribute("role");
        String email = (String) request.getAttribute("emailId");
        if ("APRENDIZ".equalsIgnoreCase(role)) {
            List<UserRegisterProfileResponseDTO> user = userService.getForDocument(document);
            if (user.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            String profileEmail = user.get(0).getEmail();
            if (profileEmail == null || email == null
                    || !profileEmail.equalsIgnoreCase(email.trim())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        return userService.uploadPhoto(document, photo)
                .map(r -> ResponseEntity.status(HttpStatus.OK).body(r))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/users/delete/{document}")
    public ResponseEntity<?> deleteByDocument(@PathVariable String document) {
        return userService.deleteUserDoc(document)
                ? ResponseEntity.status(HttpStatus.NO_CONTENT).build()
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
