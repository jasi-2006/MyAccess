package com.proyect.MyAccess.auth_service.repository;

import com.proyect.MyAccess.auth_service.entity.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAuthRepository extends JpaRepository<UserAuth, Long> {
    Optional<UserAuth> findById(Long id);
    Optional<UserAuth> findByEmail(String email);
    boolean existsByEmail(String email);
}
