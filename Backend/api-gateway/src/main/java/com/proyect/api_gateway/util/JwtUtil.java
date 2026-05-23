package com.proyect.api_gateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;

@Component
public class JwtUtil {

    private static final String DEFAULT_BASE64_SECRET = "alht7XYKujQPw1ourB0c4rIRg4x6RNrqewufShlZoug=";
    private final SecretKey secretKey;

    public JwtUtil(@Value("${security.jwt.secret-key:${JWT_SECRET_KEY:" + DEFAULT_BASE64_SECRET + "}}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
    }

    public boolean isTokenValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
