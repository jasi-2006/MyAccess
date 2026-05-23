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
        String code = String.valueOf(new Random().nextInt(900000) + 100000);
        codes.put(email, code);
        expirations.put(email, LocalDateTime.now().plusMinutes(10));
        emailService.sendVerificationCode(email, code);
    }

    public void VerifiCode(String email, String code) {
        validateCode(email, code);
        UserAuth user = userAuthRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("email no encontrado"));
        user.setVerifiedEmail(true);
        userAuthRepository.save(user);
        codes.remove(email);
        expirations.remove(email);
    }

    public void sendPasswordResetCode(String email) {
        userAuthRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("email no registrado"));
        String code = String.valueOf(new Random().nextInt(900000) + 100000);
        codes.put(email, code);
        expirations.put(email, LocalDateTime.now().plusMinutes(10));
        emailService.sendPasswordResetCode(email, code);
    }

    public void resetPassword(String email, String code, String newPassword) {
        validateCode(email, code);
        UserAuth user = userAuthRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("email no encontrado"));
        user.setPassword(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        userAuthRepository.save(user);
        codes.remove(email);
        expirations.remove(email);
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
}
