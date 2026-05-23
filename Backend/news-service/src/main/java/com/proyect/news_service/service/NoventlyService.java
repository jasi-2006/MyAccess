package com.proyect.news_service.service;

import com.proyect.news_service.dto.NoventlyRequestDTO;
import com.proyect.news_service.dto.NoventlyResponseDTO;
import com.proyect.news_service.entity.KindNovently;
import com.proyect.news_service.entity.Novently;
import com.proyect.news_service.repository.KindNoventlyRepository;
import com.proyect.news_service.repository.NoventlyRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/*
 * Servicio para gestionar las novedades del sistema.
 * Permite registrar, consultar, actualizar y eliminar novedades asociadas a usuarios.
 */
@RequiredArgsConstructor
@Service
@Transactional
public class NoventlyService {

    private final NoventlyRepository noventlyRepository;
    private final KindNoventlyRepository kindNoventlyRepository;

    /*
     * Crea y persiste una nueva novedad. Asigna la fecha de registro automáticamente.
     * @param dto Datos de la novedad a crear, incluyendo fkIdNovently opcional
     * @return NoventlyResponseDTO con los datos de la novedad creada
     */
    public NoventlyResponseDTO create(NoventlyRequestDTO dto) {
        KindNovently kind = resolveKind(dto.getFkIdNovently());
        Novently novently = new Novently();
        applyUpdate(novently, dto, kind);
        novently.setRegisterDate(LocalDateTime.now());
        noventlyRepository.save(novently);
        return toResponse(novently);
    }

    /*
     * Retorna todas las novedades registradas en el sistema.
     * @return Lista de NoventlyResponseDTO con todas las novedades
     */
    public List<NoventlyResponseDTO> getAll() {
        List<NoventlyResponseDTO> list = new ArrayList<>();
        for (Novently novently : noventlyRepository.findAll()) {
            list.add(toResponse(novently));
        }
        return list;
    }

    /*
     * Retorna todas las novedades asociadas a un usuario específico.
     * @param idUser Identificador del usuario
     * @return Lista de NoventlyResponseDTO con las novedades del usuario
     */
    public List<NoventlyResponseDTO> getByUser(Integer idUser) {
        List<NoventlyResponseDTO> list = new ArrayList<>();
        for (Novently novently : noventlyRepository.findByIdUser(idUser)) {
            list.add(toResponse(novently));
        }
        return list;
    }

    /*
     * Filtra las novedades por su estado actual.
     * @param stated Estado de la novedad a filtrar
     * @return Lista de NoventlyResponseDTO con las novedades en ese estado
     */
    public List<NoventlyResponseDTO> getByStated(String stated) {
        List<NoventlyResponseDTO> list = new ArrayList<>();
        for (Novently novently : noventlyRepository.findByStated(stated)) {
            list.add(toResponse(novently));
        }
        return list;
    }

    /*
     * Actualiza los datos de una novedad existente por su ID.
     * Si se proporciona fkIdNovently, actualiza también el tipo de novedad asociado.
     * @param id Identificador de la novedad a actualizar
     * @param dto Nuevos datos de la novedad
     * @return Optional con el NoventlyResponseDTO actualizado, vacío si no existe
     */
    public Optional<NoventlyResponseDTO> update(Long id, NoventlyRequestDTO dto) {
        return noventlyRepository.findById(id).map(novently -> {
            KindNovently kind = dto.getFkIdNovently() != null ? resolveKind(dto.getFkIdNovently()) : novently.getKindNovently();
            applyUpdate(novently, dto, kind);
            return toResponse(noventlyRepository.save(novently));
        });
    }

    /*
     * Elimina una novedad por su ID.
     * @param id Identificador de la novedad a eliminar
     * @return true si fue eliminada, false si no existía
     */
    public boolean delete(Long id) {
        if (noventlyRepository.existsById(id)) {
            noventlyRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /*
     * Busca un tipo de novedad por su ID. Lanza excepción si no existe.
     * @param fkId Identificador del tipo de novedad
     * @return Entidad KindNovently encontrada, o null si fkId es null
     */
    private KindNovently resolveKind(Long fkId) {
        if (fkId == null) return null;
        return kindNoventlyRepository.findById(fkId)
                .orElseThrow(() -> new RuntimeException("Tipo de novedad no encontrado"));
    }

    /*
     * Aplica los datos del DTO sobre una entidad Novently (usado en create y update).
     * @param novently Entidad Novently a modificar
     * @param dto Datos a aplicar
     * @param kind Tipo de novedad asociado
     */
    private void applyUpdate(Novently novently, NoventlyRequestDTO dto, KindNovently kind) {
        novently.setIdUser(dto.getIdUser());
        novently.setRegisterBy(dto.getRegisterBy());
        novently.setTitle(dto.getTitle());
        novently.setDescription(dto.getDescription());
        novently.setEvidencesUrl(dto.getEvidencesUrl());
        novently.setStated(dto.getStated());
        novently.setPriority(dto.getPriority());
        novently.setResolutionDate(dto.getResolutionDate());
        novently.setFollowDate(dto.getFollowDate());
        novently.setKindNovently(kind);
    }

    /*
     * Convierte una entidad Novently en su DTO de respuesta.
     * @param novently Entidad de novedad a convertir
     * @return NoventlyResponseDTO con los datos mapeados
     */
    private NoventlyResponseDTO toResponse(Novently novently) {
        NoventlyResponseDTO r = new NoventlyResponseDTO();
        r.setIdNovently(novently.getIdNovently());
        r.setIdUser(novently.getIdUser());
        r.setFkIdNovently(novently.getKindNovently() != null ? novently.getKindNovently().getIdNovently() : null);
        r.setRegisterBy(novently.getRegisterBy());
        r.setTitle(novently.getTitle());
        r.setDescription(novently.getDescription());
        r.setEvidencesUrl(novently.getEvidencesUrl());
        r.setStated(novently.getStated());
        r.setPriority(novently.getPriority());
        r.setRegisterDate(novently.getRegisterDate());
        r.setResolutionDate(novently.getResolutionDate());
        r.setFollowDate(novently.getFollowDate());
        r.setNotificationSend(novently.getNotificationSend());
        r.setNotificationDate(novently.getNotificationDate());
        return r;
    }
}
