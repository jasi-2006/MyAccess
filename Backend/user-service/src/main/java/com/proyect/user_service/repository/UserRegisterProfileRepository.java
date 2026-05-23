package com.proyect.user_service.repository;

import com.proyect.user_service.entity.UserRegisterProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRegisterProfileRepository extends JpaRepository<UserRegisterProfile, Long> {
    List<UserRegisterProfile> findByNameRole(String nameRole);
    List<UserRegisterProfile> findByDocument(String document);
    boolean existsByDocument(String document);
    Optional<UserRegisterProfile> findByEmail(String email);
}
