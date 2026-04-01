package com.proyect.MyAccess.news_service.service;

import com.proyect.MyAccess.news_service.dto.NoventlyRequestDTO;
import com.proyect.MyAccess.news_service.dto.NoventlyResponseDTO;
import com.proyect.MyAccess.news_service.entity.KindNovently;
import com.proyect.MyAccess.news_service.entity.Novently;
import com.proyect.MyAccess.news_service.repository.KindNoventlyRepository;
import com.proyect.MyAccess.news_service.repository.NoventlyRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
@Transactional
public class NoventlyService {

    private final NoventlyRepository noventlyRepository;
    private final KindNoventlyRepository kindNoventlyRepository;

    public NoventlyResponseDTO create(NoventlyRequestDTO dto) {
        KindNovently kind = null;
        if (dto.getFkIdNovently() != null) {
            kind = kindNoventlyRepository.findById(dto.getFkIdNovently())
                    .orElseThrow(() -> new RuntimeException("Tipo de novedad no encontrado"));
        }

        Novently novently = new Novently();
        novently.setIdUser(dto.getIdUser());
        novently.setRegisterBy(dto.getRegisterBy());
        novently.setTitle(dto.getTitle());
        novently.setDescription(dto.getDescription());
        novently.setEvidencesUrl(dto.getEvidencesUrl());
        novently.setStated(dto.getStated());
        novently.setPriority(dto.getPriority());
        novently.setRegisterDate(LocalDateTime.now());
        novently.setResolutionDate(dto.getResolutionDate());
        novently.setFollowDate(dto.getFollowDate());
        novently.setKindNovently(kind);

        noventlyRepository.save(novently);

        NoventlyResponseDTO response = new NoventlyResponseDTO();
        response.setIdNovently(novently.getIdNovently());
        response.setIdUser(novently.getIdUser());
        response.setFkIdNovently(kind != null ? kind.getIdNovently() : null);
        response.setRegisterBy(novently.getRegisterBy());
        response.setTitle(novently.getTitle());
        response.setDescription(novently.getDescription());
        response.setEvidencesUrl(novently.getEvidencesUrl());
        response.setStated(novently.getStated());
        response.setPriority(novently.getPriority());
        response.setRegisterDate(novently.getRegisterDate());
        response.setResolutionDate(novently.getResolutionDate());
        response.setFollowDate(novently.getFollowDate());
        response.setNotificationSend(novently.getNotificationSend());
        response.setNotificationDate(novently.getNotificationDate());

        return response;
    }

    public List<NoventlyResponseDTO> getAll() {
        List<Novently> noventlies = noventlyRepository.findAll();
        List<NoventlyResponseDTO> list = new ArrayList<>();

        for (Novently novently : noventlies) {
            NoventlyResponseDTO response = new NoventlyResponseDTO();
            response.setIdNovently(novently.getIdNovently());
            response.setIdUser(novently.getIdUser());
            response.setFkIdNovently(novently.getKindNovently() != null ? novently.getKindNovently().getIdNovently() : null);
            response.setRegisterBy(novently.getRegisterBy());
            response.setTitle(novently.getTitle());
            response.setDescription(novently.getDescription());
            response.setEvidencesUrl(novently.getEvidencesUrl());
            response.setStated(novently.getStated());
            response.setPriority(novently.getPriority());
            response.setRegisterDate(novently.getRegisterDate());
            response.setResolutionDate(novently.getResolutionDate());
            response.setFollowDate(novently.getFollowDate());
            response.setNotificationSend(novently.getNotificationSend());
            response.setNotificationDate(novently.getNotificationDate());
            list.add(response);
        }
        return list;
    }

    public List<NoventlyResponseDTO> getByUser(Integer idUser) {
        List<Novently> noventlies = noventlyRepository.findByIdUser(idUser);
        List<NoventlyResponseDTO> list = new ArrayList<>();

        for (Novently novently : noventlies) {
            NoventlyResponseDTO response = new NoventlyResponseDTO();
            response.setIdNovently(novently.getIdNovently());
            response.setIdUser(novently.getIdUser());
            response.setFkIdNovently(novently.getKindNovently() != null ? novently.getKindNovently().getIdNovently() : null);
            response.setRegisterBy(novently.getRegisterBy());
            response.setTitle(novently.getTitle());
            response.setDescription(novently.getDescription());
            response.setEvidencesUrl(novently.getEvidencesUrl());
            response.setStated(novently.getStated());
            response.setPriority(novently.getPriority());
            response.setRegisterDate(novently.getRegisterDate());
            response.setResolutionDate(novently.getResolutionDate());
            response.setFollowDate(novently.getFollowDate());
            response.setNotificationSend(novently.getNotificationSend());
            response.setNotificationDate(novently.getNotificationDate());
            list.add(response);
        }
        return list;
    }

    public List<NoventlyResponseDTO> getByStated(String stated) {
        List<Novently> noventlies = noventlyRepository.findByStated(stated);
        List<NoventlyResponseDTO> list = new ArrayList<>();

        for (Novently novently : noventlies) {
            NoventlyResponseDTO response = new NoventlyResponseDTO();
            response.setIdNovently(novently.getIdNovently());
            response.setIdUser(novently.getIdUser());
            response.setFkIdNovently(novently.getKindNovently() != null ? novently.getKindNovently().getIdNovently() : null);
            response.setRegisterBy(novently.getRegisterBy());
            response.setTitle(novently.getTitle());
            response.setDescription(novently.getDescription());
            response.setEvidencesUrl(novently.getEvidencesUrl());
            response.setStated(novently.getStated());
            response.setPriority(novently.getPriority());
            response.setRegisterDate(novently.getRegisterDate());
            response.setResolutionDate(novently.getResolutionDate());
            response.setFollowDate(novently.getFollowDate());
            response.setNotificationSend(novently.getNotificationSend());
            response.setNotificationDate(novently.getNotificationDate());
            list.add(response);
        }
        return list;
    }

    public Optional<NoventlyResponseDTO> update(Long id, NoventlyRequestDTO dto) {
        Optional<Novently> optionalNovently = noventlyRepository.findById(id);

        if (optionalNovently.isPresent()) {
            Novently novently = optionalNovently.get();
            novently.setIdUser(dto.getIdUser());
            novently.setRegisterBy(dto.getRegisterBy());
            novently.setTitle(dto.getTitle());
            novently.setDescription(dto.getDescription());
            novently.setEvidencesUrl(dto.getEvidencesUrl());
            novently.setStated(dto.getStated());
            novently.setPriority(dto.getPriority());
            novently.setResolutionDate(dto.getResolutionDate());
            novently.setFollowDate(dto.getFollowDate());

            if (dto.getFkIdNovently() != null) {
                KindNovently kind = kindNoventlyRepository.findById(dto.getFkIdNovently())
                        .orElseThrow(() -> new RuntimeException("Tipo de novedad no encontrado"));
                novently.setKindNovently(kind);
            }

            Novently updated = noventlyRepository.save(novently);

            NoventlyResponseDTO response = new NoventlyResponseDTO();
            response.setIdNovently(updated.getIdNovently());
            response.setIdUser(updated.getIdUser());
            response.setFkIdNovently(updated.getKindNovently() != null ? updated.getKindNovently().getIdNovently() : null);
            response.setRegisterBy(updated.getRegisterBy());
            response.setTitle(updated.getTitle());
            response.setDescription(updated.getDescription());
            response.setEvidencesUrl(updated.getEvidencesUrl());
            response.setStated(updated.getStated());
            response.setPriority(updated.getPriority());
            response.setRegisterDate(updated.getRegisterDate());
            response.setResolutionDate(updated.getResolutionDate());
            response.setFollowDate(updated.getFollowDate());
            response.setNotificationSend(updated.getNotificationSend());
            response.setNotificationDate(updated.getNotificationDate());

            return Optional.of(response);
        } else {
            return Optional.empty();
        }
    }

    public boolean delete(Long id) {
        if (noventlyRepository.existsById(id)) {
            noventlyRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
