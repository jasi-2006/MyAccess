package com.proyect.user_service.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        return build(HttpStatus.CONFLICT, "El correo o documento ya esta registrado.");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUpload(MaxUploadSizeExceededException ex) {
        return build(HttpStatus.PAYLOAD_TOO_LARGE, "La imagen supera el tamano maximo permitido (5 MB).");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        String message = ex.getMessage() == null ? "Error interno del servidor." : ex.getMessage();
        if (message.toLowerCase().contains("photo_data") || message.toLowerCase().contains("unknown column")) {
            return build(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falta configurar la base de datos para fotos. Ejecuta: ALTER TABLE user_profile ADD COLUMN photo_data LONGBLOB NULL, ADD COLUMN photo_content_type VARCHAR(100) NULL;");
        }
        return build(HttpStatus.INTERNAL_SERVER_ERROR, message);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        String message = ex.getMessage() == null ? "No fue posible completar la solicitud." : ex.getMessage();
        String lowerMessage = message.toLowerCase();

        if (lowerMessage.contains("registrado") || lowerMessage.contains("duplicate")) {
            return build(HttpStatus.CONFLICT, message);
        }
        if (lowerMessage.contains("no encontrado") || lowerMessage.contains("no existe")) {
            return build(HttpStatus.NOT_FOUND, message);
        }
        if (lowerMessage.contains("credenciales")
                || lowerMessage.contains("token invalido")
                || lowerMessage.contains("cuenta no verificada")) {
            return build(HttpStatus.UNAUTHORIZED, message);
        }
        if (lowerMessage.contains("mailersend")
                || lowerMessage.contains("failed to send email")
                || lowerMessage.contains("interrupted")) {
            return build(HttpStatus.BAD_GATEWAY, "No fue posible enviar el correo de verificacion. Intenta nuevamente.");
        }

        return build(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseEntity<Map<String, Object>> build(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
