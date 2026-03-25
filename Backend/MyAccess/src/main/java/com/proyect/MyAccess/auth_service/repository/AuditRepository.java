package com.proyect.MyAccess.auth_service.repository;

import com.proyect.MyAccess.auth_service.entity.Audit;
import com.proyect.MyAccess.entity.UserRegisterProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuditRepository extends JpaRepository<Audit, Long> {

    Optional<Audit> findById(Long id);

}