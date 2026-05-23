package com.proyect.MyAccess.notifications_service.repository;

import com.proyect.MyAccess.notifications_service.entity.Config;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ConfigRepository extends JpaRepository<Config, Long> {
    Optional<Config> findByClue(String clue);
}
