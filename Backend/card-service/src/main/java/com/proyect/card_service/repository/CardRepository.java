package com.proyect.card_service.repository;

import com.proyect.card_service.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByIdUser(Integer idUser);
}
