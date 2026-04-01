package com.proyect.MyAccess.card_service.service;

import com.proyect.MyAccess.card_service.dto.CardRequestDTO;
import com.proyect.MyAccess.card_service.dto.CardResponseDTO;
import com.proyect.MyAccess.card_service.entity.Card;
import com.proyect.MyAccess.card_service.repository.CardRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
@Transactional
public class CardService {

    private final CardRepository cardRepository;

    public CardResponseDTO create(CardRequestDTO dto) {
        Card card = new Card();
        card.setIdUser(dto.getIdUser());
        card.setPhotoUrl(dto.getPhotoUrl());
        card.setValidPhoto(dto.getValidPhoto());
        card.setDigitalState(dto.getDigitalState());
        card.setPhysicalState(dto.getPhysicalState());
        card.setDigitalIssueDate(dto.getDigitalIssueDate());
        card.setPhysicalStateDate(dto.getPhysicalStateDate());
        card.setExpirationDate(dto.getExpirationDate());
        card.setReprints(dto.getReprints());
        card.setReasonForLastReprints(dto.getReasonForLastReprints());

        cardRepository.save(card);

        CardResponseDTO response = new CardResponseDTO();
        response.setIdCard(card.getIdCard());
        response.setIdUser(card.getIdUser());
        response.setPhotoUrl(card.getPhotoUrl());
        response.setValidPhoto(card.getValidPhoto());
        response.setDigitalState(card.getDigitalState());
        response.setPhysicalState(card.getPhysicalState());
        response.setDigitalIssueDate(card.getDigitalIssueDate());
        response.setPhysicalStateDate(card.getPhysicalStateDate());
        response.setExpirationDate(card.getExpirationDate());
        response.setReprints(card.getReprints());
        response.setReasonForLastReprints(card.getReasonForLastReprints());

        return response;
    }

    public List<CardResponseDTO> getAll() {
        List<Card> cards = cardRepository.findAll();
        List<CardResponseDTO> list = new ArrayList<>();

        for (Card card : cards) {
            CardResponseDTO response = new CardResponseDTO();
            response.setIdCard(card.getIdCard());
            response.setIdUser(card.getIdUser());
            response.setPhotoUrl(card.getPhotoUrl());
            response.setValidPhoto(card.getValidPhoto());
            response.setDigitalState(card.getDigitalState());
            response.setPhysicalState(card.getPhysicalState());
            response.setDigitalIssueDate(card.getDigitalIssueDate());
            response.setPhysicalStateDate(card.getPhysicalStateDate());
            response.setExpirationDate(card.getExpirationDate());
            response.setReprints(card.getReprints());
            response.setReasonForLastReprints(card.getReasonForLastReprints());
            list.add(response);
        }
        return list;
    }

    public List<CardResponseDTO> getByUser(Integer idUser) {
        List<Card> cards = cardRepository.findByIdUser(idUser);
        List<CardResponseDTO> list = new ArrayList<>();

        for (Card card : cards) {
            CardResponseDTO response = new CardResponseDTO();
            response.setIdCard(card.getIdCard());
            response.setIdUser(card.getIdUser());
            response.setPhotoUrl(card.getPhotoUrl());
            response.setValidPhoto(card.getValidPhoto());
            response.setDigitalState(card.getDigitalState());
            response.setPhysicalState(card.getPhysicalState());
            response.setDigitalIssueDate(card.getDigitalIssueDate());
            response.setPhysicalStateDate(card.getPhysicalStateDate());
            response.setExpirationDate(card.getExpirationDate());
            response.setReprints(card.getReprints());
            response.setReasonForLastReprints(card.getReasonForLastReprints());
            list.add(response);
        }
        return list;
    }

    public Optional<CardResponseDTO> update(Long id, CardRequestDTO dto) {
        Optional<Card> optionalCard = cardRepository.findById(id);

        if (optionalCard.isPresent()) {
            Card card = optionalCard.get();
            card.setIdUser(dto.getIdUser());
            card.setPhotoUrl(dto.getPhotoUrl());
            card.setValidPhoto(dto.getValidPhoto());
            card.setDigitalState(dto.getDigitalState());
            card.setPhysicalState(dto.getPhysicalState());
            card.setDigitalIssueDate(dto.getDigitalIssueDate());
            card.setPhysicalStateDate(dto.getPhysicalStateDate());
            card.setExpirationDate(dto.getExpirationDate());
            card.setReprints(dto.getReprints());
            card.setReasonForLastReprints(dto.getReasonForLastReprints());

            Card updated = cardRepository.save(card);

            CardResponseDTO response = new CardResponseDTO();
            response.setIdCard(updated.getIdCard());
            response.setIdUser(updated.getIdUser());
            response.setPhotoUrl(updated.getPhotoUrl());
            response.setValidPhoto(updated.getValidPhoto());
            response.setDigitalState(updated.getDigitalState());
            response.setPhysicalState(updated.getPhysicalState());
            response.setDigitalIssueDate(updated.getDigitalIssueDate());
            response.setPhysicalStateDate(updated.getPhysicalStateDate());
            response.setExpirationDate(updated.getExpirationDate());
            response.setReprints(updated.getReprints());
            response.setReasonForLastReprints(updated.getReasonForLastReprints());

            return Optional.of(response);
        } else {
            return Optional.empty();
        }
    }

    public boolean delete(Long id) {
        if (cardRepository.existsById(id)) {
            cardRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
