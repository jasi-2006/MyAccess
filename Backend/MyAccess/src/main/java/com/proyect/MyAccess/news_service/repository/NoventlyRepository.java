package com.proyect.MyAccess.news_service.repository;

import com.proyect.MyAccess.news_service.entity.Novently;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoventlyRepository extends JpaRepository<Novently, Long> {
    List<Novently> findByIdUser(Integer idUser);
    List<Novently> findByStated(String stated);
    List<Novently> findByPriority(String priority);
}
