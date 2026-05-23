package com.proyect.MyAccess.notifications_service.service;

import com.proyect.MyAccess.notifications_service.dto.ConfigRequestDTO;
import com.proyect.MyAccess.notifications_service.dto.ConfigResponseDTO;
import com.proyect.MyAccess.notifications_service.entity.Config;
import com.proyect.MyAccess.notifications_service.repository.ConfigRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/*
 * Servicio para gestionar las configuraciones del sistema de notificaciones.
 * Permite crear, consultar y actualizar parámetros de configuración por clave.
 */
@RequiredArgsConstructor
@Service
@Transactional
public class ConfigService {

    private final ConfigRepository configRepository;

    /*
     * Crea y persiste una nueva configuración. Asigna la fecha de modificación automáticamente.
     * @param dto Datos de la configuración a crear
     * @return ConfigResponseDTO con los datos de la configuración creada
     */
    public ConfigResponseDTO create(ConfigRequestDTO dto) {
        Config config = new Config();
        applyUpdate(config, dto);
        configRepository.save(config);
        return toResponse(config);
    }

    /*
     * Retorna todas las configuraciones registradas en el sistema.
     * @return Lista de ConfigResponseDTO con todas las configuraciones
     */
    public List<ConfigResponseDTO> getAll() {
        List<ConfigResponseDTO> list = new ArrayList<>();
        for (Config config : configRepository.findAll()) {
            list.add(toResponse(config));
        }
        return list;
    }

    /*
     * Busca una configuración por su clave única.
     * @param clue Clave de la configuración a buscar
     * @return Optional con el ConfigResponseDTO encontrado, vacío si no existe
     */
    public Optional<ConfigResponseDTO> getByClue(String clue) {
        return configRepository.findByClue(clue).map(this::toResponse);
    }

    /*
     * Actualiza los datos de una configuración existente por su ID.
     * Actualiza la fecha de modificación automáticamente.
     * @param id Identificador de la configuración a actualizar
     * @param dto Nuevos datos de la configuración
     * @return Optional con el ConfigResponseDTO actualizado, vacío si no existe
     */
    public Optional<ConfigResponseDTO> update(Long id, ConfigRequestDTO dto) {
        return configRepository.findById(id).map(config -> {
            applyUpdate(config, dto);
            return toResponse(configRepository.save(config));
        });
    }

    /*
     * Aplica los datos del DTO sobre una entidad Config (usado en create y update).
     * @param config Entidad Config a modificar
     * @param dto Datos a aplicar
     */
    private void applyUpdate(Config config, ConfigRequestDTO dto) {
        config.setClue(dto.getClue());
        config.setValue(dto.getValue());
        config.setDescription(dto.getDescription());
        config.setModifiedBy(dto.getModifiedBy());
        config.setModifiedDate(LocalDateTime.now());
    }

    /*
     * Convierte una entidad Config en su DTO de respuesta.
     * @param config Entidad de configuración a convertir
     * @return ConfigResponseDTO con los datos mapeados
     */
    private ConfigResponseDTO toResponse(Config config) {
        ConfigResponseDTO r = new ConfigResponseDTO();
        r.setIdConfig(config.getIdConfig());
        r.setClue(config.getClue());
        r.setValue(config.getValue());
        r.setDescription(config.getDescription());
        r.setModifiedBy(config.getModifiedBy());
        r.setModifiedDate(config.getModifiedDate());
        return r;
    }
}
