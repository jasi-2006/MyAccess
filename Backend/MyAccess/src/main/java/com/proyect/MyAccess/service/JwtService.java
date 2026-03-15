package com.proyect.MyAccess.service;

import java.util.Date;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    @Value("${security.jwt.secret-key}")
    String secretKey;

    @Value("${security.jwt.token-expiration}")
    Long tokenExpiration;

    /**
     * Decodifica la clave secreta desde Bas64 a una llave real.
     * Esta es la llave "maestra" que firma y verifica cada token
     */
    private SecretKey getSignKey() {
        byte[] keyBites = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBites);
    }

    /**
     * Generación del token.
     * Es como el pasaporte digital de cada usuario
     *
     * @param userId
     * @param username
     * @param emailId
     * @return
     */
    public String generateToken(Long userId, String username, Long emailId) {
        return Jwts.builder()
                .claims(Map.of("userId", userId)) // Datos personalizados (Payload)
                .claims(Map.of("emailID", emailId)) // Datos personalizados (Payload)
                .subject(username) // Identificador del token (quién es el usuario?)
                .issuedAt(new Date()) // Fecha de creación
                .expiration(new Date(System.currentTimeMillis() + tokenExpiration)) // Vencimiento
                .signWith(getSignKey()) // Firma digital de seguridad
                .compact(); // Convierte al String final
    }

    /**
     * Verifica si el token es auténtico y si aún está vigente.
     *
     * @param token
     * @return
     */
    public Boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSignKey())
                    .build()
                    .parseSignedClaims(token);

            return true;
        } catch (JwtException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Motor de extracción
     * Permite obtener cualquier dato (claim) del token
     * Esto falla si el token está expirado
     *
     * @param <T>
     * @param token
     * @param resolver
     * @return
     */
    public <T> T extractClaims(String token, Function<Claims, T> resolver) {
        final Claims claims = Jwts.parser()
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return resolver.apply(claims);
    }

    /**
     * Extrae el username del token
     *
     * @param token
     * @return
     */
    public String extractUsername(String token) {
        return extractClaims(token, Claims::getSubject);
    }

    /**
     * Extrae el userId del token
     *
     * @param token
     * @return
     */
    public Long extractUserId(String token) {
        return extractClaims(token, claims -> claims.get("userId", Long.class));
    }

    /**
     * Extrae el email del token
     *
     * @param token
     * @return
     */
    public Long extractEmailId(String token) {
        return extractClaims(token, claims -> claims.get("emailId", Long.class));
    }

    /**
     * Genera un nuevo token con la informacion del usuario del token anterior
     * siempre y cuando la firma sea correcta
     *
     * @param token
     * @return
     */
    public String refreshToken(String token) {
        Claims claims;
        try {
            claims = Jwts.parser()
                    .verifyWith(getSignKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            claims = e.getClaims();
        } catch (JwtException e) {
            throw new RuntimeException("Token is invalid: " + e.getMessage());
        }

        return generateToken(claims.get("userId", Long.class), claims.getSubject(), claims.get("emailId", Long.class));
    }
}
