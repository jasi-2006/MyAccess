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

    /** En Render el puerto 587 suele estar bloqueado; dejar false y usar BREVO_API_KEY. */
    @Value("${app.mail.smtp-enabled:false}")
    private boolean smtpEnabled;

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
                if (!smtpEnabled || !isSmtpConfigured()) {
                    throw mapToEmailDeliveryException(ex);
                }
            }
        }

        if (!smtpEnabled) {
            throw new EmailDeliveryException(
                    "Falta BREVO_API_KEY en el servidor. En Render no uses SMTP (puerto 587 bloqueado). "
                            + "Crea una clave API en Brevo (xkeysib-...) y configurala como BREVO_API_KEY junto con EMAIL_FROM.");
        }

        if (isSmtpConfigured()) {
            try {
                sendViaSmtp(to, subject, text);
                return;
            } catch (Exception ex) {
                log.error("Brevo SMTP fallo: {}", ex.getMessage());
                throw new EmailDeliveryException(
                        "No fue posible enviar el correo por SMTP. En Render configura BREVO_API_KEY (la clave xsmtpsib no sirve como API).",
                        ex);
            }
        }

        throw new EmailDeliveryException(
                "Correo no configurado. Define BREVO_API_KEY y EMAIL_FROM en Render.");
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
        String trimmed = fromEmail.trim();
        if (!trimmed.contains("@") || trimmed.startsWith("@") || !trimmed.contains(".")) {
            throw new EmailDeliveryException(
                    "EMAIL_FROM debe ser un correo electronico (ej. tu@gmail.com), no un nombre como '"
                            + trimmed
                            + "'. Verificalo en Brevo > Remitentes y ponlo en Render.");
        }
    }

    private EmailDeliveryException mapToEmailDeliveryException(Exception ex) {
        String raw = ex.getMessage() == null ? "" : ex.getMessage();
        int status = extractHttpStatus(raw);
        String lower = raw.toLowerCase();

        if (status == 401 || lower.contains("unauthorized") || lower.contains("api key")) {
            return new EmailDeliveryException(
                    "BREVO_API_KEY invalida o revocada. Genera una nueva clave xkeysib- en Brevo y actualiza Render.",
                    ex);
        }
        if (status == 400 || lower.contains("sender") || lower.contains("from") || lower.contains("not valid")) {
            return new EmailDeliveryException(
                    "EMAIL_FROM no es un remitente verificado en Brevo. En Render pon el mismo correo que validaste en Brevo > Remitentes.",
                    ex);
        }
        if (status == 403) {
            return new EmailDeliveryException(
                    "La clave API de Brevo no tiene permiso para enviar correos. Revisa permisos de la clave en Brevo.",
                    ex);
        }
        return new EmailDeliveryException(
                "No fue posible enviar el correo en este momento. Intenta reenviar el codigo en unos minutos.",
                ex);
    }

    private int extractHttpStatus(String message) {
        int idx = message.indexOf("status ");
        if (idx < 0) {
            return -1;
        }
        int start = idx + "status ".length();
        int end = start;
        while (end < message.length() && Character.isDigit(message.charAt(end))) {
            end++;
        }
        if (end == start) {
            return -1;
        }
        try {
            return Integer.parseInt(message.substring(start, end));
        } catch (NumberFormatException ex) {
            return -1;
        }
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
            throw mapBrevoApiError(response.statusCode(), body);
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

    private EmailDeliveryException mapBrevoApiError(int status, String body) {
        String lower = body.toLowerCase();
        if (status == 401) {
            return new EmailDeliveryException(
                    "BREVO_API_KEY invalida. Copia de nuevo la clave xkeysib- desde Brevo > Claves API.");
        }
        if (status == 400 || lower.contains("sender") || lower.contains("from")) {
            return new EmailDeliveryException(
                    "EMAIL_FROM invalido: debe ser el correo verificado en Brevo > Remitentes (no 'MyAccess' ni el login SMTP).");
        }
        if (status == 403) {
            return new EmailDeliveryException("La clave API de Brevo no tiene permisos para enviar correos.");
        }
        return new EmailDeliveryException("Brevo respondio con error " + status + ". Revisa BREVO_API_KEY y EMAIL_FROM en Render.");
    }

    private String escapeJson(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "\\r")
                .replace("\n", "\\n");
    }
}
