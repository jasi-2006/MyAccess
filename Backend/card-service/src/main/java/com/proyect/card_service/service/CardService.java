package com.proyect.card_service.service;

import com.proyect.card_service.dto.CardRequestDTO;
import com.proyect.card_service.dto.CardResponseDTO;
import com.proyect.card_service.entity.Card;
import com.proyect.card_service.repository.CardRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/*
 * Servicio para gestionar los carnets de los usuarios.
 * Permite crear, consultar, actualizar y eliminar carnets digitales y físicos.
 */
@RequiredArgsConstructor
@Service
@Transactional
public class CardService {

    private final CardRepository cardRepository;

    /*
     * Crea y persiste un nuevo carnet para un usuario.
     * @param dto Datos del carnet a crear
     * @return CardResponseDTO con los datos del carnet creado
     */
    public CardResponseDTO create(CardRequestDTO dto) {
        Card card = new Card();
        applyCreate(card, dto);
        cardRepository.save(card);
        return toResponse(card);
    }

    /*
     * Retorna todos los carnets registrados en el sistema.
     * @return Lista de CardResponseDTO con todos los carnets
     */
    public List<CardResponseDTO> getAll() {
        List<CardResponseDTO> list = new ArrayList<>();
        for (Card card : cardRepository.findAll()) {
            list.add(toResponse(card));
        }
        return list;
    }

    /*
     * Retorna todos los carnets asociados a un usuario específico.
     * @param idUser Identificador del usuario
     * @return Lista de CardResponseDTO con los carnets del usuario
     */
    public List<CardResponseDTO> getByUser(Integer idUser) {
        List<CardResponseDTO> list = new ArrayList<>();
        for (Card card : cardRepository.findByIdUser(idUser)) {
            list.add(toResponse(card));
        }
        return list;
    }

    /*
     * Actualiza los datos de un carnet existente por su ID.
     * @param id Identificador del carnet a actualizar
     * @param dto Nuevos datos del carnet
     * @return Optional con el CardResponseDTO actualizado, vacío si no existe
     */
    public Optional<CardResponseDTO> update(Long id, CardRequestDTO dto) {
        return cardRepository.findById(id).map(card -> {
            applyPartialUpdate(card, dto);
            return toResponse(cardRepository.save(card));
        });
    }

    /*
     * Activa o desactiva un carnet sin modificar el resto de sus datos.
     * @param id Identificador del carnet
     * @param active Nuevo estado activo/inactivo
     * @return Optional con el CardResponseDTO actualizado, vacio si no existe
     */
    public Optional<CardResponseDTO> updateActiveState(Long id, Boolean active) {
        return cardRepository.findById(id).map(card -> {
            card.setActive(Boolean.TRUE.equals(active));
            return toResponse(cardRepository.save(card));
        });
    }

    /*
     * Elimina un carnet por su ID.
     * @param id Identificador del carnet a eliminar
     * @return true si fue eliminado, false si no existía
     */
    public boolean delete(Long id) {
        if (cardRepository.existsById(id)) {
            cardRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /*
     * Aplica los datos del DTO sobre una entidad Card (usado en create y update).
     * @param card Entidad Card a modificar
     * @param dto Datos a aplicar
     */
    private void applyCreate(Card card, CardRequestDTO dto) {
        card.setIdUser(dto.getIdUser());
        card.setPhotoUrl(dto.getPhotoUrl());
        card.setValidPhoto(dto.getValidPhoto() != null ? dto.getValidPhoto() : false);
        card.setDigitalState(dto.getDigitalState() != null ? dto.getDigitalState() : "pendiente");
        card.setPhysicalState(dto.getPhysicalState() != null ? dto.getPhysicalState() : "no solicitado");
        if (dto.getActive() != null) card.setActive(dto.getActive());
        card.setDigitalIssueDate(dto.getDigitalIssueDate());
        card.setPhysicalStateDate(dto.getPhysicalStateDate());
        card.setExpirationDate(dto.getExpirationDate());
        card.setReprints(dto.getReprints() != null ? dto.getReprints() : 0);
        card.setReasonForLastReprints(dto.getReasonForLastReprints());
    }

    /*
     * Actualiza solo los campos recibidos para evitar borrar datos del carnet.
     * @param card Entidad Card a modificar
     * @param dto Datos parciales a aplicar
     */
    private void applyPartialUpdate(Card card, CardRequestDTO dto) {
        if (dto.getIdUser() != null) card.setIdUser(dto.getIdUser());
        if (dto.getPhotoUrl() != null) card.setPhotoUrl(dto.getPhotoUrl());
        if (dto.getValidPhoto() != null) card.setValidPhoto(dto.getValidPhoto());
        if (dto.getDigitalState() != null) card.setDigitalState(dto.getDigitalState());
        if (dto.getPhysicalState() != null) card.setPhysicalState(dto.getPhysicalState());
        if (dto.getActive() != null) card.setActive(dto.getActive());
        if (dto.getDigitalIssueDate() != null) card.setDigitalIssueDate(dto.getDigitalIssueDate());
        if (dto.getPhysicalStateDate() != null) card.setPhysicalStateDate(dto.getPhysicalStateDate());
        if (dto.getExpirationDate() != null) card.setExpirationDate(dto.getExpirationDate());
        if (dto.getReprints() != null) card.setReprints(dto.getReprints());
        if (dto.getReasonForLastReprints() != null) card.setReasonForLastReprints(dto.getReasonForLastReprints());
    }

    /*
     * Convierte una entidad Card en su DTO de respuesta.
     * @param card Entidad de carnet a convertir
     * @return CardResponseDTO con los datos mapeados
     */
    private CardResponseDTO toResponse(Card card) {
        CardResponseDTO r = new CardResponseDTO();
        r.setIdCard(card.getIdCard());
        r.setIdUser(card.getIdUser());
        r.setPhotoUrl(card.getPhotoUrl());
        r.setValidPhoto(card.getValidPhoto());
        r.setDigitalState(card.getDigitalState());
        r.setPhysicalState(card.getPhysicalState());
        r.setActive(card.getActive());
        r.setDigitalIssueDate(card.getDigitalIssueDate());
        r.setPhysicalStateDate(card.getPhysicalStateDate());
        r.setExpirationDate(card.getExpirationDate());
        r.setReprints(card.getReprints());
        r.setReasonForLastReprints(card.getReasonForLastReprints());
        return r;
    }
}
