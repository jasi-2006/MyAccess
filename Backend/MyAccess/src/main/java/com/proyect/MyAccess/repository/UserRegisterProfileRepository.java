package com.proyect.MyAccess.repository;

import com.proyect.MyAccess.entity.UserRegisterProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRegisterProfileRepository extends JpaRepository<UserRegisterProfile, Long> {

    Optional<UserRegisterProfile> findById(Long id);
    List <UserRegisterProfile> findByNameRole(String nameRole);
    List <UserRegisterProfile> findByDocument(String document);

}
