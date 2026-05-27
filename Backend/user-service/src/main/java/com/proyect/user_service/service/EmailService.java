package com.proyect.user_service.service;

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
 * Envio de correos via MailerSend.
 * 1) API REST (token mlsn...)
 * 2) SMTP MailerSend como respaldo (usuario/contraseña SMTP)
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private static final String MAILERSEND_API_URL = "https://api.mailersend.com/v1/email";

    private final JavaMailSender mailSender;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${app.mailersend.api-key:}")
    private String apiKey;

    @Value("${app.mailersend.from-email:}")
    private String fromEmail;

    @Value("${app.mailersend.from-name:MyAccess}")
    private String fromName;

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

        Exception apiError = null;
        if (apiKey != null && !apiKey.isBlank()) {
            try {
                sendViaMailerSendApi(to, subject, text);
                return;
            } catch (Exception ex) {
                apiError = ex;
                log.warn("MailerSend API fallo, intentando SMTP: {}", ex.getMessage());
            }
        } else {
            log.warn("MAILERSEND_API_KEY no configurada, usando solo SMTP");
        }

        try {
            sendViaSmtp(to, subject, text);
        } catch (Exception smtpError) {
            if (apiError != null) {
                throw new IllegalStateException(
                        "No fue posible enviar correo (API y SMTP fallaron). API: "
                                + apiError.getMessage()
                                + " | SMTP: "
                                + smtpError.getMessage(),
                        smtpError);
            }
            throw new IllegalStateException("No fue posible enviar correo por SMTP: " + smtpError.getMessage(), smtpError);
        }
    }

    private void validateFromEmail() {
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new IllegalStateException("EMAIL_FROM no configurado (remitente MailerSend verificado)");
        }
    }

    private void sendViaMailerSendApi(String to, String subject, String text) throws IOException, InterruptedException {
        String payload = """
                {
                  "from": {
                    "email": "%s",
                    "name": "%s"
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
                escapeJson(fromEmail),
                escapeJson(fromName),
                escapeJson(to),
                escapeJson(subject),
                escapeJson(text));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(MAILERSEND_API_URL))
                .header("Authorization", "Bearer " + apiKey.trim())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            log.error("MailerSend API status={} body={}", response.statusCode(), response.body());
            throw new IllegalStateException(
                    "MailerSend API status " + response.statusCode() + ": " + response.body());
        }
        log.info("Correo enviado via MailerSend API a {}", to);
    }

    private void sendViaSmtp(String to, String subject, String text) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
        helper.setFrom(fromEmail, fromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(text, false);
        mailSender.send(message);
        log.info("Correo enviado via MailerSend SMTP a {}", to);
    }

    private String escapeJson(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "\\r")
                .replace("\n", "\\n");
    }
}
