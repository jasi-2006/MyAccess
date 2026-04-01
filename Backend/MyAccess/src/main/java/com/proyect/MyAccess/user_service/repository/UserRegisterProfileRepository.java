package com.proyect.MyAccess.user_service.repository;

import com.proyect.MyAccess.user_service.entity.UserRegisterProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRegisterProfileRepository extends JpaRepository<UserRegisterProfile, Long> {

    Optional<UserRegisterProfile> findById(Long id);
    List <UserRegisterProfile> findByNameRole(String nameRole);
    List <UserRegisterProfile> findByDocument(String document);
    Optional <UserRegisterProfile> findByEmail(String email);
    boolean existsByEmail(String email);
}