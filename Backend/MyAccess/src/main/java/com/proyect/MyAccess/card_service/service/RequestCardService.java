package com.proyect.MyAccess.card_service.service;

import com.proyect.MyAccess.card_service.dto.RequestCardRequestDTO;
import com.proyect.MyAccess.card_service.dto.RequestCardResponseDTO;
import com.proyect.MyAccess.card_service.entity.Card;
import com.proyect.MyAccess.card_service.entity.RequestCard;
import com.proyect.MyAccess.card_service.repository.CardRepository;
import com.proyect.MyAccess.card_service.repository.RequestCardRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
@Transactional
public class RequestCardService {

    private final RequestCardRepository requestCardRepository;
    private final CardRepository cardRepository;

    public RequestCardResponseDTO create(RequestCardRequestDTO dto) {
        Card card = null;
        if (dto.getIdCard() != null) {
            card = cardRepository.findById(dto.getIdCard())
                    .orElseThrow(() -> new RuntimeException("Carnet no encontrado"));
        }

        RequestCard request = new RequestCard();
        request.setIdUser(dto.getIdUser());
        request.setRequestTipe(dto.getRequestTipe());
        request.setCardTipe(dto.getCardTipe());
        request.setState(dto.getState());
        request.setReasonRejection(dto.getReasonRejection());
        request.setApprobedBy(dto.getApprobedBy());
        request.setPrintedBy(dto.getPrintedBy());
        request.setCard(card);

        requestCardRepository.save(request);

        RequestCardResponseDTO response = new RequestCardResponseDTO();
        response.setIdRequest(request.getIdRequest());
        response.setIdUser(request.getIdUser());
        response.setRequestTipe(request.getRequestTipe());
        response.setCardTipe(request.getCardTipe());
        response.setState(request.getState());
        response.setReasonRejection(request.getReasonRejection());
        response.setApprobedBy(request.getApprobedBy());
        response.setPrintedBy(request.getPrintedBy());
        response.setRegistrationDate(request.getRegistrationDate());
        response.setIdCard(card != null ? card.getIdCard() : null);

        return response;
    }

    public List<RequestCardResponseDTO> getAll() {
        List<RequestCard> requests = requestCardRepository.findAll();
        List<RequestCardResponseDTO> list = new ArrayList<>();

        for (RequestCard request : requests) {
            RequestCardResponseDTO response = new RequestCardResponseDTO();
            response.setIdRequest(request.getIdRequest());
            response.setIdUser(request.getIdUser());
            response.setRequestTipe(request.getRequestTipe());
            response.setCardTipe(request.getCardTipe());
            response.setState(request.getState());
            response.setReasonRejection(request.getReasonRejection());
            response.setApprobedBy(request.getApprobedBy());
            response.setPrintedBy(request.getPrintedBy());
            response.setRegistrationDate(request.getRegistrationDate());
            response.setIdCard(request.getCard() != null ? request.getCard().getIdCard() : null);
            list.add(response);
        }
        return list;
    }

    public List<RequestCardResponseDTO> getByUser(Integer idUser) {
        List<RequestCard> requests = requestCardRepository.findByIdUser(idUser);
        List<RequestCardResponseDTO> list = new ArrayList<>();

        for (RequestCard request : requests) {
            RequestCardResponseDTO response = new RequestCardResponseDTO();
            response.setIdRequest(request.getIdRequest());
            response.setIdUser(request.getIdUser());
            response.setRequestTipe(request.getRequestTipe());
            response.setCardTipe(request.getCardTipe());
            response.setState(request.getState());
            response.setReasonRejection(request.getReasonRejection());
            response.setApprobedBy(request.getApprobedBy());
            response.setPrintedBy(request.getPrintedBy());
            response.setRegistrationDate(request.getRegistrationDate());
            response.setIdCard(request.getCard() != null ? request.getCard().getIdCard() : null);
            list.add(response);
        }
        return list;
    }

    public List<RequestCardResponseDTO> getByState(String state) {
        List<RequestCard> requests = requestCardRepository.findByState(state);
        List<RequestCardResponseDTO> list = new ArrayList<>();

        for (RequestCard request : requests) {
            RequestCardResponseDTO response = new RequestCardResponseDTO();
            response.setIdRequest(request.getIdRequest());
            response.setIdUser(request.getIdUser());
            response.setRequestTipe(request.getRequestTipe());
            response.setCardTipe(request.getCardTipe());
            response.setState(request.getState());
            response.setReasonRejection(request.getReasonRejection());
            response.setApprobedBy(request.getApprobedBy());
            response.setPrintedBy(request.getPrintedBy());
            response.setRegistrationDate(request.getRegistrationDate());
            response.setIdCard(request.getCard() != null ? request.getCard().getIdCard() : null);
            list.add(response);
        }
        return list;
    }

    public Optional<RequestCardResponseDTO> update(Long id, RequestCardRequestDTO dto) {
        Optional<RequestCard> optionalRequest = requestCardRepository.findById(id);

        if (optionalRequest.isPresent()) {
            RequestCard request = optionalRequest.get();
            request.setIdUser(dto.getIdUser());
            request.setRequestTipe(dto.getRequestTipe());
            request.setCardTipe(dto.getCardTipe());
            request.setState(dto.getState());
            request.setReasonRejection(dto.getReasonRejection());
            request.setApprobedBy(dto.getApprobedBy());
            request.setPrintedBy(dto.getPrintedBy());

            if (dto.getIdCard() != null) {
                Card card = cardRepository.findById(dto.getIdCard())
                        .orElseThrow(() -> new RuntimeException("Carnet no encontrado"));
                request.setCard(card);
            }

            RequestCard updated = requestCardRepository.save(request);

            RequestCardResponseDTO response = new RequestCardResponseDTO();
            response.setIdRequest(updated.getIdRequest());
            response.setIdUser(updated.getIdUser());
            response.setRequestTipe(updated.getRequestTipe());
            response.setCardTipe(updated.getCardTipe());
            response.setState(updated.getState());
            response.setReasonRejection(updated.getReasonRejection());
            response.setApprobedBy(updated.getApprobedBy());
            response.setPrintedBy(updated.getPrintedBy());
            response.setRegistrationDate(updated.getRegistrationDate());
            response.setIdCard(updated.getCard() != null ? updated.getCard().getIdCard() : null);

            return Optional.of(response);
        } else {
            return Optional.empty();
        }
    }
}
