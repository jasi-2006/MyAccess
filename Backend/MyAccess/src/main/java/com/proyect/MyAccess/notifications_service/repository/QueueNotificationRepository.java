package com.proyect.MyAccess.notifications_service.repository;

import com.proyect.MyAccess.notifications_service.entity.QueueNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QueueNotificationRepository extends JpaRepository<QueueNotification, Long> {
    List<QueueNotification> findByChanel(String chanel);
    List<QueueNotification> findByOrderByPriorityAsc();
}
