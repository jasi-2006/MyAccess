package com.proyect.user_service.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        return build(HttpStatus.CONFLICT, "El correo o documento ya esta registrado.");
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
