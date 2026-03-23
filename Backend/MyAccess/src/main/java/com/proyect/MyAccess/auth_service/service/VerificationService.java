package com.proyect.MyAccess.service;

import com.proyect.MyAccess.entity.UserRegisterProfile;
import com.proyect.MyAccess.repository.UserRegisterProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import  java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class VerificationService {
    private final UserRegisterProfileRepository userRepository;
    private final EmailService emailService;

    public void sendCode(String email){
        UserRegisterProfile user = userRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("email no registrado"));
        String code = String.valueOf(new Random().nextInt(900000)+ 100000);
        user.setVerificationCode(code);
        user.setCodeExpiration(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        emailService.sendVerificationCode(email, code);
    }
    public void VerifiCode( String email, String code){
        UserRegisterProfile user= userRepository.findByEmail(email)
                .orElseThrow(()-> new RuntimeException("email no encontrado"));
        if(user.getCodeExpiration().isBefore(LocalDateTime.now())){
            throw new RuntimeException("el codigo ya expiro");
        }
        if(user.getVerificationCode().equals(code)){
            throw  new RuntimeException("el codigo es incorrecto ");
        }
        user.setVerified(true);
        user.setVerificationCode(null);
        user.setCodeExpiration(null);
        userRepository.save(user);

    }
}
