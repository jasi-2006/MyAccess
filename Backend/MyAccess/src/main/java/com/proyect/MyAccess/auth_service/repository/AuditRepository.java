package com.proyect.MyAccess.auth_service.repository;

import com.proyect.MyAccess.auth_service.entity.Audit;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;

public interface AuditRepository extends JpaRepository<Audit, Long> {

    Optional<Audit> findById(Long id);

}