package com.proyect.api_gateway.filter;

import com.proyect.api_gateway.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

@Component
public class JwtAuthFilter extends AbstractGatewayFilterFactory<Object> {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        super(Object.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Object config) {
        return (exchange, chain) -> {

            // Dejar pasar preflight CORS sin validar token
            if (exchange.getRequest().getMethod().name().equals("OPTIONS")) {
                return chain.filter(exchange);
            }

            String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            String token = authHeader.substring(7);

            if (!jwtUtil.isTokenValid(token)) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            Claims claims = jwtUtil.getClaims(token);
            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .header("x-User-id", String.valueOf(claims.get("userId")))
                    .header("X-User-Email", claims.get("emailId", String.class))
                    .header("X-User-role", claims.get("role", String.class))
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        };
    }
}
