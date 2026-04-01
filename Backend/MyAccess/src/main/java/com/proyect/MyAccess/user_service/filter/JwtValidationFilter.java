package com.proyect.MyAccess.user_service.filter;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.proyect.MyAccess.user_service.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component("userJwtValidationFilter")
public class JwtValidationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        if (path.startsWith("/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String userId = request.getHeader("x-User-id");
        String email  = request.getHeader("X-User-Email");
        String role   = request.getHeader("X-User-role");

        if (userId == null || role == null) {
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
}
