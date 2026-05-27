package com.proyect.user_service.service;

import com.proyect.auth_service.entity.UserAuth;
import com.proyect.auth_service.repository.UserAuthRepository;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final UserAuthRepository userAuthRepository;
    private final EmailService emailService;

    private final Map<String, String> codes = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> expirations = new ConcurrentHashMap<>();

    public void sendCode(String email) {
        String normalizedEmail = normalizeEmail(email);
        userAuthRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("email no registrado"));

        String code = String.valueOf(new Random().nextInt(900000) + 100000);
        codes.put(normalizedEmail, code);
        expirations.put(normalizedEmail, LocalDateTime.now().plusMinutes(10));
        emailService.sendVerificationCode(normalizedEmail, code);
    }

    public void VerifiCode(String email, String code) {
        String normalizedEmail = normalizeEmail(email);
        validateCode(normalizedEmail, code);
        UserAuth user = userAuthRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("email no encontrado"));
        user.setVerifiedEmail(true);
        userAuthRepository.save(user);
        codes.remove(normalizedEmail);
        expirations.remove(normalizedEmail);
    }

    public void sendPasswordResetCode(String email) {
        String normalizedEmail = normalizeEmail(email);
        userAuthRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("email no registrado"));
        String code = String.valueOf(new Random().nextInt(900000) + 100000);
        codes.put(normalizedEmail, code);
        expirations.put(normalizedEmail, LocalDateTime.now().plusMinutes(10));
        emailService.sendPasswordResetCode(normalizedEmail, code);
    }

    public void resetPassword(String email, String code, String newPassword) {
        String normalizedEmail = normalizeEmail(email);
        validateCode(normalizedEmail, code);
        UserAuth user = userAuthRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("email no encontrado"));
        user.setPassword(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        userAuthRepository.save(user);
        codes.remove(normalizedEmail);
        expirations.remove(normalizedEmail);
    }

    private void validateCode(String email, String code) {
        LocalDateTime expiration = expirations.get(email);
        if (expiration == null || expiration.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("el codigo ya expiro");
        }
        if (!code.equals(codes.get(email))) {
            throw new RuntimeException("el codigo es incorrecto");
        }
    }

    private String normalizeEmail(String email) {
        String normalized = email == null ? "" : email.trim().toLowerCase();
        if (normalized.isBlank()) {
            throw new RuntimeException("email no registrado");
        }
        return normalized;
    }
}
