package com.proyect.MyAccess.news_service.repository;

import com.proyect.MyAccess.news_service.entity.KindNovently;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface KindNoventlyRepository extends JpaRepository<KindNovently, Long> {
    List<KindNovently> findByActivo(Boolean activo);
    List<KindNovently> findByCategory(String category);
}
