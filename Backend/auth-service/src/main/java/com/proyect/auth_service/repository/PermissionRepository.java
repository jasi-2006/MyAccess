package com.proyect.auth_service.repository;

import com.proyect.auth_service.entity.Permissions;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PermissionRepository extends JpaRepository <Permissions, Long> {
        Optional<Permissions> findById(Long id);
}
