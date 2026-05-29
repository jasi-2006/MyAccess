package com.proyect.user_service.service;

import com.proyect.user_service.exception.EmailDeliveryException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

/**
 * Envio de correos via Brevo (Sendinblue).
 * 1) API REST (recomendado en Render) — BREVO_API_KEY
 * 2) SMTP relay — SMTP_USERNAME / SMTP_PASSWORD
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final JavaMailSender mailSender;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${app.brevo.api-key:}")
    private String brevoApiKey;

    @Value("${app.mail.from-email:}")
    private String fromEmail;

    @Value("${app.mail.from-name:MyAccess}")
    private String fromName;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${spring.mail.password:}")
    private String smtpPassword;

    public void sendVerificationCode(String to, String code) {
        String subject = "MyAccess - Confirma tu correo";
        String text = """
                Estamos muy emocionados de tenerte con nosotros. Para empezar a usar MyAccess, solo necesitamos confirmar que esta direccion de correo te pertenece.

                Introduce el siguiente codigo en la aplicacion para activar tu cuenta:

                %s

                (Este codigo es valido por los proximos 10 minutos)

                Una vez verificado, podras entrar y empezar a gestionar tus accesos de inmediato.

                Si tienes alguna duda, responde a este correo.

                Nos vemos dentro.
                El equipo de MyAccess
                """.formatted(code).trim();

        sendEmail(to, subject, text);
    }

    public void sendPasswordResetCode(String to, String code) {
        String subject = "MyAccess - Restablecer contrasena";
        String text = """
                Recibimos una solicitud para restablecer tu contrasena.

                Usa el siguiente codigo para continuar:

                %s

                (Este codigo es valido por 10 minutos)

                Si no solicitaste esto, ignora este correo.

                El equipo de MyAccess
                """.formatted(code).trim();

        sendEmail(to, subject, text);
    }

    private void sendEmail(String to, String subject, String text) {
        validateFromEmail();

        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            try {
                sendViaBrevoApi(to, subject, text);
                return;
            } catch (EmailDeliveryException ex) {
                throw ex;
            } catch (Exception ex) {
                log.warn("Brevo API fallo: {}", ex.getMessage());
                if (!isSmtpConfigured()) {
                    throw mapToEmailDeliveryException(ex);
                }
            }
        }

        if (isSmtpConfigured()) {
            try {
                sendViaSmtp(to, subject, text);
                return;
            } catch (Exception ex) {
                log.error("Brevo SMTP fallo: {}", ex.getMessage());
                throw new EmailDeliveryException(
                        "No fue posible enviar el correo por SMTP. En Render usa BREVO_API_KEY (API). Detalle: "
                                + ex.getMessage(),
                        ex);
            }
        }

        throw new EmailDeliveryException(
                "Correo no configurado. En Render define BREVO_API_KEY y EMAIL_FROM. "
                        + "Opcional: SMTP_USERNAME y SMTP_PASSWORD para SMTP.");
    }

    private boolean isSmtpConfigured() {
        return smtpUsername != null && !smtpUsername.isBlank()
                && smtpPassword != null && !smtpPassword.isBlank();
    }

    private void validateFromEmail() {
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new EmailDeliveryException(
                    "EMAIL_FROM no configurado. Usa un remitente verificado en Brevo (Senders).");
        }
    }

    private EmailDeliveryException mapToEmailDeliveryException(Exception ex) {
        String raw = ex.getMessage() == null ? "" : ex.getMessage();
        if (raw.contains("status 401") || raw.contains("status 403")) {
            return new EmailDeliveryException(
                    "Clave o remitente de Brevo invalidos. Revisa BREVO_API_KEY y EMAIL_FROM en Render.", ex);
        }
        return new EmailDeliveryException(
                "No fue posible enviar el correo en este momento. Intenta reenviar el codigo en unos minutos.",
                ex);
    }

    private void sendViaBrevoApi(String to, String subject, String text) throws IOException, InterruptedException {
        String payload = """
                {
                  "sender": {
                    "name": "%s",
                    "email": "%s"
                  },
                  "to": [
                    {
                      "email": "%s"
                    }
                  ],
                  "subject": "%s",
                  "textContent": "%s"
                }
                """.formatted(
                escapeJson(fromName),
                escapeJson(fromEmail),
                escapeJson(to),
                escapeJson(subject),
                escapeJson(text));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BREVO_API_URL))
                .header("api-key", brevoApiKey.trim())
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            String body = response.body() == null ? "" : response.body();
            log.error("Brevo API status={} body={}", response.statusCode(), body);
            throw new IllegalStateException("Brevo API status " + response.statusCode() + ": " + body);
        }
        log.info("Correo enviado via Brevo API a {}", to);
    }

    private void sendViaSmtp(String to, String subject, String text) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
        helper.setFrom(fromEmail, fromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(text, false);
        mailSender.send(message);
        log.info("Correo enviado via Brevo SMTP a {}", to);
    }

    private String escapeJson(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "\\r")
                .replace("\n", "\\n");
    }
}
