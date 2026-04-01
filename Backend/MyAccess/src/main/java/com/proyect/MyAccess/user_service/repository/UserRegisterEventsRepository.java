package com.proyect.MyAccess.user_service.repository;

import com.proyect.MyAccess.user_service.entity.UserRegisterEvents;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRegisterEventsRepository extends JpaRepository <UserRegisterEvents, Long> {
    Optional<UserRegisterEvents>findById(Long id);
    List<UserRegisterEvents> findByUserProfileId(Long userId);

}