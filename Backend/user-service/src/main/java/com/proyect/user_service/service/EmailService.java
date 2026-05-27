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
    private static final String MAILERSEND_URL = "https://api.mailersend.com/v1/email";

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${MAILERSEND_API_KEY:mlsn.7316b05544b03b95db9dcc3cfa482517f2397b448f2227ec61692816978db7e6}")
    private String apiKey;

    @Value("${EMAIL_FROM:MS_F19U7O@test-r83ql3p3z8xgzw1j.mlsender.net}")
    private String from;

    public void sendVerificationCode(String to, String code) {
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
        String subject = "MyAccess - Restablecer contrasena";
        String text = "Recibimos una solicitud para restablecer tu contrasena.\n\n"
                + "Usa el siguiente codigo para continuar:\n\n"
                + code
                + "\n\n(Este codigo es valido por 10 minutos)\n\n"
                + "Si no solicitaste esto, ignora este correo.\n\n"
                + "El equipo de MyAccess";

        sendEmail(to, subject, text);
    }

    private void sendEmail(String to, String subject, String text) {
        String payload = """
                {
                  "from": {
                    "email": "%s",
                    "name": "MyAccess"
                  },
                  "to": [
                    {
                      "email": "%s"
                    }
                  ],
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
                .uri(URI.create(MAILERSEND_URL))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("MailerSend API returned status " + response.statusCode() + ": " + response.body());
            }
            log.info("Email successfully sent through MailerSend REST API to {}", to);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to send email through MailerSend", e);
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
