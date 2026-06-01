package com.proyect.user_service.exception;

/**
 * Error al enviar correo (proveedor, cuota, configuracion).
 */
public class EmailDeliveryException extends RuntimeException {

    public EmailDeliveryException(String message) {
        super(message);
    }

    public EmailDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
