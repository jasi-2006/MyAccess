package com.proyect.auth_service.repository;

import com.proyect.auth_service.entity.Audit;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;

public interface AuditRepository extends JpaRepository<Audit, Long> {

    Optional<Audit> findById(Long id);

}
