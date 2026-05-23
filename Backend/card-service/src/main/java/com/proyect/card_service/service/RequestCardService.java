package com.proyect.card_service.service;

import com.proyect.card_service.dto.RequestCardRequestDTO;
import com.proyect.card_service.dto.RequestCardResponseDTO;
import com.proyect.card_service.entity.Card;
import com.proyect.card_service.entity.RequestCard;
import com.proyect.card_service.repository.CardRepository;
import com.proyect.card_service.repository.RequestCardRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/*
 * Servicio para gestionar las solicitudes de carnet.
 * Permite crear y consultar solicitudes de emisión o reimpresión de carnets.
 */
@RequiredArgsConstructor
@Service
@Transactional
public class RequestCardService {

    private final RequestCardRepository requestCardRepository;
    private final CardRepository cardRepository;

    /*
     * Crea una nueva solicitud de carnet asociada opcionalmente a un carnet existente.
     * @param dto Datos de la solicitud, incluyendo idCard opcional
     * @return RequestCardResponseDTO con los datos de la solicitud creada
     */
    public RequestCardResponseDTO create(RequestCardRequestDTO dto) {
        Card card = resolveCard(dto.getIdCard());
        RequestCard request = new RequestCard();
        applyUpdate(request, dto, card);
        requestCardRepository.save(request);
        return toResponse(request);
    }

    /*
     * Retorna todas las solicitudes de carnet registradas.
     * @return Lista de RequestCardResponseDTO con todas las solicitudes
     */
    public List<RequestCardResponseDTO> getAll() {
        List<RequestCardResponseDTO> list = new ArrayList<>();
        for (RequestCard request : requestCardRepository.findAll()) {
            list.add(toResponse(request));
        }
        return list;
    }

    /*
     * Retorna todas las solicitudes asociadas a un usuario específico.
     * @param idUser Identificador del usuario
     * @return Lista de RequestCardResponseDTO con las solicitudes del usuario
     */
    public List<RequestCardResponseDTO> getByUser(Integer idUser) {
        List<RequestCardResponseDTO> list = new ArrayList<>();
        for (RequestCard request : requestCardRepository.findByIdUser(idUser)) {
            list.add(toResponse(request));
        }
        return list;
    }

    /*
     * Filtra las solicitudes por su estado actual.
     * @param state Estado de la solicitud a filtrar
     * @return Lista de RequestCardResponseDTO con las solicitudes en ese estado
     */
    public List<RequestCardResponseDTO> getByState(String state) {
        List<RequestCardResponseDTO> list = new ArrayList<>();
        for (RequestCard request : requestCardRepository.findByState(state)) {
            list.add(toResponse(request));
        }
        return list;
    }

    /*
     * Actualiza una solicitud existente por su ID.
     * Si se proporciona idCard, actualiza también el carnet asociado.
     * @param id Identificador de la solicitud a actualizar
     * @param dto Nuevos datos de la solicitud
     * @return Optional con el RequestCardResponseDTO actualizado, vacío si no existe
     */
    public Optional<RequestCardResponseDTO> update(Long id, RequestCardRequestDTO dto) {
        return requestCardRepository.findById(id).map(request -> {
            Card card = dto.getIdCard() != null ? resolveCard(dto.getIdCard()) : request.getCard();
            applyUpdate(request, dto, card);
            return toResponse(requestCardRepository.save(request));
        });
    }

    /*
     * Busca un carnet por su ID. Lanza excepción si no existe.
     * @param idCard Identificador del carnet
     * @return Entidad Card encontrada, o null si idCard es null
     */
    private Card resolveCard(Long idCard) {
        if (idCard == null) return null;
        return cardRepository.findById(idCard)
                .orElseThrow(() -> new RuntimeException("Carnet no encontrado"));
    }

    /*
     * Aplica los datos del DTO sobre una entidad RequestCard (usado en create y update).
     * @param request Entidad RequestCard a modificar
     * @param dto Datos a aplicar
     * @param card Carnet asociado a la solicitud
     */
    private void applyUpdate(RequestCard request, RequestCardRequestDTO dto, Card card) {
        request.setIdUser(dto.getIdUser());
        request.setRequestTipe(dto.getRequestTipe());
        request.setCardTipe(dto.getCardTipe());
        request.setState(dto.getState());
        request.setReasonRejection(dto.getReasonRejection());
        request.setApprobedBy(dto.getApprobedBy());
        request.setPrintedBy(dto.getPrintedBy());
        request.setCard(card);
    }

    /*
     * Convierte una entidad RequestCard en su DTO de respuesta.
     * @param request Entidad de solicitud a convertir
     * @return RequestCardResponseDTO con los datos mapeados
     */
    private RequestCardResponseDTO toResponse(RequestCard request) {
        RequestCardResponseDTO r = new RequestCardResponseDTO();
        r.setIdRequest(request.getIdRequest());
        r.setIdUser(request.getIdUser());
        r.setRequestTipe(request.getRequestTipe());
        r.setCardTipe(request.getCardTipe());
        r.setState(request.getState());
        r.setReasonRejection(request.getReasonRejection());
        r.setApprobedBy(request.getApprobedBy());
        r.setPrintedBy(request.getPrintedBy());
        r.setRegistrationDate(request.getRegistrationDate());
        r.setIdCard(request.getCard() != null ? request.getCard().getIdCard() : null);
        return r;
    }
}
