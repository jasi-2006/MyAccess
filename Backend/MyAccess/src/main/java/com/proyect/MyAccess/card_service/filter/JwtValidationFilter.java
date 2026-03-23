package com.proyect.MyAccess.filter;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.proyect.MyAccess.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtValidationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtValidationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        if (path.equals("/auth/login") || path.equals("/auth/register")|| path.equals("/auth/verify")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendError(response, "Header Authorization is missing or invalid");
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtService.isTokenValid(token)) {
                sendError(response, "Token is invalid or expired");
                return;
            }

            request.setAttribute("username", jwtService.extractName(token));
            request.setAttribute("userId", jwtService.extractUserId(token));
            request.setAttribute("emailId", jwtService.extractEmailId(token));
            request.setAttribute("role", jwtService.extractRole(token));

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            sendError(response, "Token validation failed");
        }
    }

    private void sendError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
    }
}
