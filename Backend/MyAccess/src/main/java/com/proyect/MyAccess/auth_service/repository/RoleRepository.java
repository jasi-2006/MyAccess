package com.proyect.MyAccess.auth_service.repository;

import com.proyect.MyAccess.auth_service.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findById(Long id);
    Optional<Role> findByNameRole(String nameRole);
}
