package com.proyect.MyAccess.notifications_service.repository;

import com.proyect.MyAccess.notifications_service.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByIdUser(Integer idUser);
    List<Notification> findByStatedSend(String statedSend);
}
