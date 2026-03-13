package com.proyect.MyAccess.repository;

import com.proyect.MyAccess.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findById(Long id);
    List <UserProfile> findByNameRole(String nameRole);
    List <UserProfile> findByDocument(String document);

}
