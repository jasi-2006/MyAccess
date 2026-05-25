package com.proyect.auth_service.filter;

import java.io.IOException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.proyect.auth_service.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component("authJwtValidationFilter")
@RequiredArgsConstructor
public class JwtValidationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        if (path.startsWith("/auth/") || request.getMethod().equalsIgnoreCase("OPTIONS")) {
            filterChain.doFilter(request, response);
            return;
        }

        String userId = request.getHeader("x-User-id");
        String email  = request.getHeader("X-User-Email");
        String role   = request.getHeader("X-User-role");

        if (userId == null || email == null || email.isBlank() || role == null || role.isBlank()) {
            String token = extractBearerToken(request);
            if (token != null && jwtService.isTokenValid(token)) {
                userId = String.valueOf(jwtService.extractUserId(token));
                email = jwtService.extractEmailId(token);
                role = jwtService.extractRole(token);
            }
        }

        if (userId == null || email == null || email.isBlank() || role == null || role.isBlank()) {
            sendError(response, "Missing gateway headers");
            return;
        }

        request.setAttribute("userId", Long.parseLong(userId));
        request.setAttribute("emailId", email);
        request.setAttribute("role", role);

        filterChain.doFilter(request, response);
    }

    private void sendError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
    }

    private String extractBearerToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }
        String token = authorization.substring(7).trim();
        return token.isEmpty() ? null : token;
    }
}
