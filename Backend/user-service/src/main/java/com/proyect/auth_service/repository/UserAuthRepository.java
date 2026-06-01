package com.proyect.auth_service.repository;

import com.proyect.auth_service.entity.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserAuthRepository extends JpaRepository<UserAuth, Long> {
    Optional<UserAuth> findById(Long id);
    Optional<UserAuth> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM UserAuth u LEFT JOIN FETCH u.role WHERE LOWER(u.email) = LOWER(:email)")
    Optional<UserAuth> findByEmailWithRole(@Param("email") String email);
}
