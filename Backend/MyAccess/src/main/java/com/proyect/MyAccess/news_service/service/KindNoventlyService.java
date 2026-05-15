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

/*
 * Servicio para gestionar los tipos de novedad del sistema.
 * Permite crear, consultar y actualizar categorías de novedades.
 */
@RequiredArgsConstructor
@Service
@Transactional
public class KindNoventlyService {

    private final KindNoventlyRepository kindNoventlyRepository;

    /*
     * Crea y persiste un nuevo tipo de novedad.
     * @param dto Datos del tipo de novedad a crear
     * @return KindNoventlyResponseDTO con los datos del tipo creado
     */
    public KindNoventlyResponseDTO create(KindNoventlyRequestDTO dto) {
        KindNovently kind = new KindNovently();
        applyUpdate(kind, dto);
        kindNoventlyRepository.save(kind);
        return toResponse(kind);
    }

    /*
     * Retorna todos los tipos de novedad registrados.
     * @return Lista de KindNoventlyResponseDTO con todos los tipos
     */
    public List<KindNoventlyResponseDTO> getAll() {
        List<KindNoventlyResponseDTO> list = new ArrayList<>();
        for (KindNovently kind : kindNoventlyRepository.findAll()) {
            list.add(toResponse(kind));
        }
        return list;
    }

    /*
     * Retorna solo los tipos de novedad que están activos.
     * @return Lista de KindNoventlyResponseDTO con los tipos activos
     */
    public List<KindNoventlyResponseDTO> getActivos() {
        List<KindNoventlyResponseDTO> list = new ArrayList<>();
        for (KindNovently kind : kindNoventlyRepository.findByActivo(true)) {
            list.add(toResponse(kind));
        }
        return list;
    }

    /*
     * Actualiza los datos de un tipo de novedad existente por su ID.
     * @param id Identificador del tipo de novedad a actualizar
     * @param dto Nuevos datos del tipo de novedad
     * @return Optional con el KindNoventlyResponseDTO actualizado, vacío si no existe
     */
    public Optional<KindNoventlyResponseDTO> update(Long id, KindNoventlyRequestDTO dto) {
        return kindNoventlyRepository.findById(id).map(kind -> {
            applyUpdate(kind, dto);
            return toResponse(kindNoventlyRepository.save(kind));
        });
    }

    /*
     * Aplica los datos del DTO sobre una entidad KindNovently (usado en create y update).
     * @param kind Entidad KindNovently a modificar
     * @param dto Datos a aplicar
     */
    private void applyUpdate(KindNovently kind, KindNoventlyRequestDTO dto) {
        kind.setName(dto.getName());
        kind.setCategory(dto.getCategory());
        kind.setRequiresApproval(dto.getRequiresApproval());
        kind.setDescription(dto.getDescription());
        kind.setActivo(dto.getActivo());
    }

    /*
     * Convierte una entidad KindNovently en su DTO de respuesta.
     * @param kind Entidad de tipo de novedad a convertir
     * @return KindNoventlyResponseDTO con los datos mapeados
     */
    private KindNoventlyResponseDTO toResponse(KindNovently kind) {
        KindNoventlyResponseDTO r = new KindNoventlyResponseDTO();
        r.setIdNovently(kind.getIdNovently());
        r.setName(kind.getName());
        r.setCategory(kind.getCategory());
        r.setRequiresApproval(kind.getRequiresApproval());
        r.setDescription(kind.getDescription());
        r.setActivo(kind.getActivo());
        return r;
    }
}
