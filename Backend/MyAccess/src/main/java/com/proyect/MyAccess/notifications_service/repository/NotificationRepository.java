package com.proyect.MyAccess.notifications_service.repository;

import com.proyect.MyAccess.notifications_service.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByIdUser(Integer idUser);
    List<Notification> findByStatedSend(String statedSend);

    @Query("""
            SELECT n FROM Notification n
            WHERE LOWER(CONCAT('', n.idNotifications)) LIKE LOWER(CONCAT('%', :filter, '%'))
               OR LOWER(CONCAT('', n.idUser)) LIKE LOWER(CONCAT('%', :filter, '%'))
               OR LOWER(COALESCE(n.tipe, '')) LIKE LOWER(CONCAT('%', :filter, '%'))
               OR LOWER(COALESCE(n.category, '')) LIKE LOWER(CONCAT('%', :filter, '%'))
               OR LOWER(COALESCE(n.affair, '')) LIKE LOWER(CONCAT('%', :filter, '%'))
               OR LOWER(COALESCE(n.messaje, '')) LIKE LOWER(CONCAT('%', :filter, '%'))
               OR LOWER(COALESCE(n.statedSend, '')) LIKE LOWER(CONCAT('%', :filter, '%'))
            """)
    List<Notification> search(@Param("filter") String filter);

    @Query("""
            SELECT n FROM Notification n
            WHERE n.idUser = :idUser
              AND (
                LOWER(CONCAT('', n.idNotifications)) LIKE LOWER(CONCAT('%', :filter, '%'))
                OR LOWER(CONCAT('', n.idUser)) LIKE LOWER(CONCAT('%', :filter, '%'))
                OR LOWER(COALESCE(n.tipe, '')) LIKE LOWER(CONCAT('%', :filter, '%'))
                OR LOWER(COALESCE(n.category, '')) LIKE LOWER(CONCAT('%', :filter, '%'))
                OR LOWER(COALESCE(n.affair, '')) LIKE LOWER(CONCAT('%', :filter, '%'))
                OR LOWER(COALESCE(n.messaje, '')) LIKE LOWER(CONCAT('%', :filter, '%'))
                OR LOWER(COALESCE(n.statedSend, '')) LIKE LOWER(CONCAT('%', :filter, '%'))
              )
            """)
    List<Notification> searchByUser(@Param("idUser") Integer idUser, @Param("filter") String filter);
}
