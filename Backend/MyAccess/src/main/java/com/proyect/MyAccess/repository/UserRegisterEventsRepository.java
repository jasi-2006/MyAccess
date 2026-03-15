package com.proyect.MyAccess.repository;

import com.proyect.MyAccess.entity.UserRegisterEvents;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRegisterEventsRepository extends JpaRepository <UserRegisterEvents, Long> {
    Optional<UserRegisterEvents>findById(Long id);
}