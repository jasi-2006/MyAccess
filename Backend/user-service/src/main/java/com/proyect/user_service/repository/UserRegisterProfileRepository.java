package com.proyect.user_service.repository;

import com.proyect.user_service.entity.UserRegisterProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRegisterProfileRepository extends JpaRepository<UserRegisterProfile, Long> {
    List<UserRegisterProfile> findByNameRole(String nameRole);
    List<UserRegisterProfile> findByDocument(String document);
    boolean existsByDocument(String document);
    boolean existsByEmail(String email);
    Optional<UserRegisterProfile> findByEmail(String email);

    @Query("SELECT p FROM UserRegisterProfile p WHERE LOWER(p.email) = LOWER(:email)")
    Optional<UserRegisterProfile> findByEmailIgnoreCase(@Param("email") String email);

    @Query(value = "SELECT nameRole FROM user_profile WHERE LOWER(email) = LOWER(:email) LIMIT 1", nativeQuery = true)
    Optional<String> findNameRoleColumnByEmail(@Param("email") String email);

    Optional<UserRegisterProfile> findByPhotoUrl(String photoUrl);
}
