package com.proyect.MyAccess.news_service.service;

import com.proyect.MyAccess.news_service.dto.KindNoventlyRequestDTO;
import com.proyect.MyAccess.news_service.dto.KindNoventlyResponseDTO;
import com.proyect.MyAccess.news_service.entity.KindNovently;
import com.proyect.MyAccess.news_service.repository.KindNoventlyRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
@Transactional
public class KindNoventlyService {

    private final KindNoventlyRepository kindNoventlyRepository;

    public KindNoventlyResponseDTO create(KindNoventlyRequestDTO dto) {
        KindNovently kind = new KindNovently();
        kind.setName(dto.getName());
        kind.setCategory(dto.getCategory());
        kind.setRequiresApproval(dto.getRequiresApproval());
        kind.setDescription(dto.getDescription());
        kind.setActivo(dto.getActivo());

        kindNoventlyRepository.save(kind);

        KindNoventlyResponseDTO response = new KindNoventlyResponseDTO();
        response.setIdNovently(kind.getIdNovently());
        response.setName(kind.getName());
        response.setCategory(kind.getCategory());
        response.setRequiresApproval(kind.getRequiresApproval());
        response.setDescription(kind.getDescription());
        response.setActivo(kind.getActivo());

        return response;
    }

    public List<KindNoventlyResponseDTO> getAll() {
        List<KindNovently> kinds = kindNoventlyRepository.findAll();
        List<KindNoventlyResponseDTO> list = new ArrayList<>();

        for (KindNovently kind : kinds) {
            KindNoventlyResponseDTO response = new KindNoventlyResponseDTO();
            response.setIdNovently(kind.getIdNovently());
            response.setName(kind.getName());
            response.setCategory(kind.getCategory());
            response.setRequiresApproval(kind.getRequiresApproval());
            response.setDescription(kind.getDescription());
            response.setActivo(kind.getActivo());
            list.add(response);
        }
        return list;
    }

    public List<KindNoventlyResponseDTO> getActivos() {
        List<KindNovently> kinds = kindNoventlyRepository.findByActivo(true);
        List<KindNoventlyResponseDTO> list = new ArrayList<>();

        for (KindNovently kind : kinds) {
            KindNoventlyResponseDTO response = new KindNoventlyResponseDTO();
            response.setIdNovently(kind.getIdNovently());
            response.setName(kind.getName());
            response.setCategory(kind.getCategory());
            response.setRequiresApproval(kind.getRequiresApproval());
            response.setDescription(kind.getDescription());
            response.setActivo(kind.getActivo());
            list.add(response);
        }
        return list;
    }

    public Optional<KindNoventlyResponseDTO> update(Long id, KindNoventlyRequestDTO dto) {
        Optional<KindNovently> optionalKind = kindNoventlyRepository.findById(id);

        if (optionalKind.isPresent()) {
            KindNovently kind = optionalKind.get();
            kind.setName(dto.getName());
            kind.setCategory(dto.getCategory());
            kind.setRequiresApproval(dto.getRequiresApproval());
            kind.setDescription(dto.getDescription());
            kind.setActivo(dto.getActivo());

            KindNovently updated = kindNoventlyRepository.save(kind);

            KindNoventlyResponseDTO response = new KindNoventlyResponseDTO();
            response.setIdNovently(updated.getIdNovently());
            response.setName(updated.getName());
            response.setCategory(updated.getCategory());
            response.setRequiresApproval(updated.getRequiresApproval());
            response.setDescription(updated.getDescription());
            response.setActivo(updated.getActivo());

            return Optional.of(response);
        } else {
            return Optional.empty();
        }
    }
}
