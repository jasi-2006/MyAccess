package com.proyect.card_service.repository;

import com.proyect.card_service.entity.RequestCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequestCardRepository extends JpaRepository<RequestCard, Long> {
    List<RequestCard> findByIdUser(Integer idUser);
    List<RequestCard> findByState(String state);
}
