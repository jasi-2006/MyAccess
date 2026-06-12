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

    @org.springframework.beans.factory.annotation.Value("${app.validation-service.url:http://localhost:5005}")
    private String validationServiceUrl;

    @org.springframework.beans.factory.annotation.Value("${app.notifications-service.url:http://localhost:9094}")
    private String notificationsServiceUrl;

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(UserRegisterProfileController.class);

    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    @PutMapping("/users/document/{document}/sofia-verified")
    public ResponseEntity<UserRegisterProfileResponseDTO> updateSofiaVerified(
            @PathVariable String document,
            @RequestParam Boolean verified,
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
        
        UserRegisterProfileRequestDTO dto = new UserRegisterProfileRequestDTO();
        dto.setSofiaVerified(verified);
        return userService.updateUserForDocument(document, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping("/users/document/{document}/verify-sofia")
    public ResponseEntity<?> verifySofiaPlus(
            @PathVariable String document,
            @RequestBody java.util.Map<String, Object> body,
            HttpServletRequest request) {
        
        String role = (String) request.getAttribute("role");
        String email = (String) request.getAttribute("emailId");
        
        List<UserRegisterProfileResponseDTO> userList = userService.getForDocument(document);
        if (userList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        UserRegisterProfileResponseDTO localProfile = userList.get(0);
        
        if ("APRENDIZ".equalsIgnoreCase(role)) {
            String profileEmail = localProfile.getEmail();
            if (profileEmail == null || email == null
                    || !profileEmail.equalsIgnoreCase(email.trim())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        String password = (String) body.get("password");
        Boolean useMock = (Boolean) body.get("useMock");
        if (useMock == null) {
            useMock = false;
        }

        java.util.Map<String, Object> pythonRequest = new java.util.HashMap<>();
        pythonRequest.put("documentType", localProfile.getTypeDocument() != null ? localProfile.getTypeDocument() : "CC");
        pythonRequest.put("documentNumber", document);
        pythonRequest.put("password", password != null ? password : "");
        pythonRequest.put("useMock", useMock);

        java.util.Map<String, Object> profileData = new java.util.HashMap<>();
        profileData.put("fullName", localProfile.getFullName());
        profileData.put("ficha", localProfile.getFicha());
        profileData.put("trainingProgram", localProfile.getTrainingProgram());
        pythonRequest.put("localProfile", profileData);

        try {
            String requestBodyStr = objectMapper.writeValueAsString(pythonRequest);
            
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest pythonReq = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(validationServiceUrl + "/validate-sofia"))
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(requestBodyStr))
                    .build();

            java.net.http.HttpResponse<String> response = client.send(pythonReq, java.net.http.HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                java.util.Map<String, Object> responseMap = objectMapper.readValue(response.body(), java.util.Map.class);
                Boolean success = (Boolean) responseMap.get("success");
                if (Boolean.TRUE.equals(success)) {
                    UserRegisterProfileRequestDTO updateDto = new UserRegisterProfileRequestDTO();
                    updateDto.setSofiaVerified(true);
                    userService.updateUserForDocument(document, updateDto);
                } else {
                    // Send notifications to apprentice and administrator
                    sendMismatchNotifications(client, localProfile, responseMap);
                }
                return ResponseEntity.ok(responseMap);
            } else {
                return ResponseEntity.status(response.statusCode()).body(response.body());
            }

        } catch (Exception e) {
            log.error("Error al comunicarse con el servicio de validación: {}", e.getMessage());
            java.util.Map<String, Object> errResponse = new java.util.HashMap<>();
            errResponse.put("success", false);
            errResponse.put("message", "Error al comunicarse con el servicio de validación: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errResponse);
        }
    }

    private void sendMismatchNotifications(java.net.http.HttpClient client, UserRegisterProfileResponseDTO localProfile, java.util.Map<String, Object> responseMap) {
        // Apprentice notification
        try {
            java.util.Map<String, Object> notifApprentice = new java.util.HashMap<>();
            notifApprentice.put("idUser", localProfile.getId().intValue());
            notifApprentice.put("tipe", "APP");
            notifApprentice.put("category", "ALERTA");
            notifApprentice.put("affair", "Discrepancia en datos del carnet");
            notifApprentice.put("messaje", "Se detectaron diferencias entre tu carnet local y el registro de Sofia Plus. Ingresa a tu perfil para corregirlos de inmediato.");
            notifApprentice.put("statedSend", "PENDIENTE");

            java.net.http.HttpRequest reqApprentice = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(notificationsServiceUrl + "/notificationsService/notifications"))
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(notifApprentice)))
                    .build();
            client.send(reqApprentice, java.net.http.HttpResponse.BodyHandlers.discarding());
            log.info("Notification sent to apprentice ID: {}", localProfile.getId());
        } catch (Exception ex) {
            log.warn("Failed to create apprentice notification: {}", ex.getMessage());
        }

        // Admin notification
        try {
            List<UserRegisterProfileResponseDTO> admins = userService.getForNameRol("ADMIN");
            for (UserRegisterProfileResponseDTO admin : admins) {
                java.util.Map<String, Object> notifAdmin = new java.util.HashMap<>();
                notifAdmin.put("idUser", admin.getId().intValue());
                notifAdmin.put("tipe", "APP");
                notifAdmin.put("category", "ALERTA");
                notifAdmin.put("affair", "Discrepancia en carnet de: " + localProfile.getFullName());
                notifAdmin.put("messaje", "El aprendiz " + localProfile.getFullName() + " (Doc: " + localProfile.getDocument() + ") presenta discrepancias en sus datos locales respecto a Sofia Plus.");
                notifAdmin.put("statedSend", "PENDIENTE");

                java.net.http.HttpRequest reqAdmin = java.net.http.HttpRequest.newBuilder()
                        .uri(java.net.URI.create(notificationsServiceUrl + "/notificationsService/notifications"))
                        .header("Content-Type", "application/json")
                        .POST(java.net.http.HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(notifAdmin)))
                        .build();
                client.send(reqAdmin, java.net.http.HttpResponse.BodyHandlers.discarding());
                log.info("Notification sent to admin ID: {}", admin.getId());
            }
        } catch (Exception ex) {
            log.warn("Failed to create admin notification: {}", ex.getMessage());
        }
    }

}

