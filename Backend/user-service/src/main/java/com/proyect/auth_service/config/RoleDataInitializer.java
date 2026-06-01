package com.proyect.auth_service.config;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.proyect.auth_service.entity.Role;
import com.proyect.auth_service.repository.RoleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Crea los roles base en auth_service.roles si la base está vacía o incompleta.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RoleDataInitializer {

    private final RoleRepository roleRepository;

    private static final List<RoleSeed> DEFAULT_ROLES = List.of(
            new RoleSeed("APRENDIZ", "Aprendiz del sistema"),
            new RoleSeed("INSTRUCTOR", "Instructor del centro de formacion"),
            new RoleSeed("ADMIN", "Administrador del sistema"));

    @EventListener(ApplicationReadyEvent.class)
    @Transactional(transactionManager = "authTransactionManager")
    public void seedDefaultRoles() {
        for (RoleSeed seed : DEFAULT_ROLES) {
            roleRepository.findByNameRoleIgnoreCase(seed.nameRole())
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setNameRole(seed.nameRole());
                        role.setDescription(seed.description());
                        role.setAsset(true);
                        role.setDateCreation(LocalDateTime.now());
                        Role saved = roleRepository.save(role);
                        log.info("Rol '{}' creado en auth_service.roles (id={})", seed.nameRole(), saved.getId());
                        return saved;
                    });
        }
    }

    private record RoleSeed(String nameRole, String description) {}
}
