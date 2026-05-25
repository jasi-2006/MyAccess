package com.proyect.user_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
@Slf4j
public class EmailService {
    private static final String RESEND_URL = "https://api.resend.com/emails";

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${RESEND_API_KEY:}")
    private String apiKey;

    @Value("${EMAIL_FROM:}")
    private String from;

    public void sendVerificationCode(String to, String code) {
        if (!isConfigured()) {
            log.warn("Resend is not configured. Verification code for {} was not sent.", to);
            return;
        }

        String subject = "MyAccess - Confirma tu correo";
        String text = "Estamos muy emocionados de tenerte con nosotros. Para empezar a usar MyAccess, solo necesitamos confirmar que esta direccion de correo te pertenece.\n\n"
                + "Introduce el siguiente codigo en la aplicacion para activar tu cuenta:\n\n"
                + code
                + "\n\n(Este codigo es valido por los proximos 10 minutos)\n\n"
                + "Una vez verificado, podras entrar y empezar a gestionar tus accesos de inmediato.\n\n"
                + "Si tienes alguna duda, responde a este correo.\n\n"
                + "Nos vemos dentro.\n"
                + "El equipo de MyAccess";

        sendEmail(to, subject, text);
    }

    public void sendPasswordResetCode(String to, String code) {
        if (!isConfigured()) {
            log.warn("Resend is not configured. Password reset code for {} was not sent.", to);
            return;
        }

        String subject = "MyAccess - Restablecer contrasena";
        String text = "Recibimos una solicitud para restablecer tu contrasena.\n\n"
                + "Usa el siguiente codigo para continuar:\n\n"
                + code
                + "\n\n(Este codigo es valido por 10 minutos)\n\n"
                + "Si no solicitaste esto, ignora este correo.\n\n"
                + "El equipo de MyAccess";

        sendEmail(to, subject, text);
    }

    private boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank() && from != null && !from.isBlank();
    }

    private void sendEmail(String to, String subject, String text) {
        String payload = """
                {
                  "from": "%s",
                  "to": ["%s"],
                  "subject": "%s",
                  "text": "%s"
                }
                """.formatted(
                escapeJson(from),
                escapeJson(to),
                escapeJson(subject),
                escapeJson(text)
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(RESEND_URL))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Resend API returned status " + response.statusCode() + ": " + response.body());
            }
        } catch (IOException e) {
            throw new IllegalStateException("Failed to send email through Resend", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Email sending was interrupted", e);
        }
    }

    private String escapeJson(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "\\r")
                .replace("\n", "\\n");
    }
}
