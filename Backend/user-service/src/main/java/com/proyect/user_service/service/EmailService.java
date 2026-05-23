package com.proyect.user_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String from;

    public void sendVerificationCode(String to, String code){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("MyAccess¡Ya casi estás ha dentro!🚀 ");
        message.setText("Estamos muy emocionados de tenerte con nosotros. Para empezar a usar MyAccess, solo necesitamos confirmar que esta dirección de correo te pertenece.\n" +
                "\n" +
                "Introduce el siguiente código en la aplicación para activar tu cuenta:\n" +
                "\n" + code+
                "(Este código es válido por los próximos 10 minutos)\n" +
                "\n" +
                "Una vez verificado, podrás entrar y empezar a gestionar tus accesos de inmediato.\n" +
                "\n" +
                "¿Tienes alguna duda? Solo responde a este correo, estamos aquí para ayudarte.\n" +
                "\n" +
                "¡Nos vemos dentro!\n" +
                "El equipo de MyAccess"
        );
        mailSender.send(message);
    }

    public void sendPasswordResetCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("MyAccess - Restablecer contraseña");
        message.setText("Recibimos una solicitud para restablecer tu contraseña.\n\n" +
                "Usa el siguiente código para continuar:\n\n" + code + "\n\n" +
                "(Este código es válido por 10 minutos)\n\n" +
                "Si no solicitaste esto, ignora este correo.\n\n" +
                "El equipo de MyAccess");
        mailSender.send(message);
    }
}
