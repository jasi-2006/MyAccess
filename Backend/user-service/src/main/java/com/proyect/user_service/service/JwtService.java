package com.proyect.user_service.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

@Service("userJwtService")
public class JwtService {

    private final SecretKey secretKey;
    private final long expiration;
    private final long refreshExpiration;

    public JwtService(
            @Value("${security.jwt.secret-key}") String secret,
            @Value("${security.jwt.tokenExpiration}") long expiration,
            @Value("${security.jwt.refreshTokenExpiration:604800000}") long refreshExpiration) {
        this.secretKey = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
        this.expiration = expiration;
        this.refreshExpiration = refreshExpiration;
    }

    public String generateToken(Long userId, String email, String role) {
        return generateToken(userId, email, role, expiration, "access");
    }

    public String generateRefreshToken(Long userId, String email, String role) {
        return generateToken(userId, email, role, refreshExpiration, "refresh");
    }

    private String generateToken(Long userId, String email, String role, long tokenExpiration, String tokenType) {
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("emailId", email)
                .claim("role", role)
                .claim("tokenType", tokenType)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + tokenExpiration))
                .signWith(secretKey)
                .compact();
    }

    public boolean isTokenValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractName(String token) {
        return getClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return getClaims(token).get("userId", Long.class);
    }

    public String extractEmailId(String token) {
        return getClaims(token).get("emailId", String.class);
    }

    public String extractRole(String token) {return getClaims(token).get("role", String.class);
    }

    public boolean isRefreshToken(String token) {
        return "refresh".equals(getClaims(token).get("tokenType", String.class));
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
