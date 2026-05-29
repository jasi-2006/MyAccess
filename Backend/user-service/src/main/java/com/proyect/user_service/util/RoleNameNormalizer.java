package com.proyect.user_service.util;

/**
 * Normaliza nombres de rol guardados en user_profile.nameRole y en el JWT.
 */
public final class RoleNameNormalizer {

    private RoleNameNormalizer() {
    }

    public static String normalize(String role) {
        if (role == null || role.isBlank()) {
            return "APRENDIZ";
        }

        String normalized = role.trim().toUpperCase();

        return switch (normalized) {
            case "ADMIN", "ADMINISTRADOR", "ADMINISTRATOR", "ANDIM", "ADMIM" -> "ADMIN";
            case "INSTRUCTOR", "INSTRUCTORA" -> "INSTRUCTOR";
            case "APRENDIZ", "ESTUDIANTE", "STUDENT" -> "APRENDIZ";
            default -> normalized;
        };
    }
}
