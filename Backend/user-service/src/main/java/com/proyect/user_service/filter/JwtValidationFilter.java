package com.proyect.user_service.filter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.proyect.user_service.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component("userJwtValidationFilter")
@RequiredArgsConstructor
public class JwtValidationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;

    @Value("${app.cors.allowed-origins:https://my-access-ashy.vercel.app,https://my-access-omega.vercel.app,http://localhost:3000,http://localhost:5173}")
    private String allowedOrigins;

    private boolean isPublicPath(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/auth/")
                || path.equals("/register/user/password")
                || path.startsWith("/uploads/")
                || path.equals("/error")
                || request.getMethod().equalsIgnoreCase("OPTIONS");
    }

    private void addCorsHeaders(HttpServletRequest request, HttpServletResponse response) {
        String origin = request.getHeader("Origin");
        if (origin != null) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Vary", "Origin");
            response.setHeader("Access-Control-Allow-Credentials", "true");
        }
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD");
        response.setHeader("Access-Control-Allow-Headers", "*");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (isPublicPath(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getServletPath();
        boolean profileMeRequest = path.equals("/register/profile/me");
        String userId = firstHeader(request, "x-User-id", "X-User-Id", "X-User-ID", "x-user-id");
        String email  = firstHeader(request, "X-User-Email", "x-user-email");
        String role   = firstHeader(request, "X-User-role", "X-User-Role", "x-user-role");

        if (userId == null || email == null || email.isBlank() || (!profileMeRequest && (role == null || role.isBlank()))) {
            String token = extractBearerToken(request);
            if (token == null) {
                sendError(request, response, "Missing Authorization token");
                return;
            }
            if (jwtService.isTokenValid(token)) {
                userId = String.valueOf(jwtService.extractUserId(token));
                email = jwtService.extractEmailId(token);
                role = jwtService.extractRole(token);
            } else {
                sendError(request, response, "Invalid Authorization token");
                return;
            }
        }

        if (userId == null || email == null || email.isBlank() || (!profileMeRequest && (role == null || role.isBlank()))) {
            sendError(request, response, "Missing token claims");
            return;
        }

        request.setAttribute("userId", Long.parseLong(userId));
        request.setAttribute("emailId", email);
        request.setAttribute("role", role);

        filterChain.doFilter(request, response);
    }

    private void sendError(HttpServletRequest request, HttpServletResponse response, String message) throws IOException {
        addCorsHeaders(request, response);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
    }

    private String extractBearerToken(HttpServletRequest request) {
        String authorization = firstHeader(request, "Authorization", "authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }
        String token = authorization.substring(7).trim();
        return token.isEmpty() ? null : token;
    }

    private String firstHeader(HttpServletRequest request, String... names) {
        for (String name : names) {
            String value = request.getHeader(name);
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private List<String> parseAllowedOrigins() {
        return Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList();
    }
}
