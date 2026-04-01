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

@RequiredArgsConstructor
@Service
@Transactional
public class ConfigService {

    private final ConfigRepository configRepository;

    public ConfigResponseDTO create(ConfigRequestDTO dto) {
        Config config = new Config();
        config.setClue(dto.getClue());
        config.setValue(dto.getValue());
        config.setDescription(dto.getDescription());
        config.setModifiedBy(dto.getModifiedBy());
        config.setModifiedDate(LocalDateTime.now());

        configRepository.save(config);

        ConfigResponseDTO response = new ConfigResponseDTO();
        response.setIdConfig(config.getIdConfig());
        response.setClue(config.getClue());
        response.setValue(config.getValue());
        response.setDescription(config.getDescription());
        response.setModifiedBy(config.getModifiedBy());
        response.setModifiedDate(config.getModifiedDate());

        return response;
    }

    public List<ConfigResponseDTO> getAll() {
        List<Config> configs = configRepository.findAll();
        List<ConfigResponseDTO> list = new ArrayList<>();

        for (Config config : configs) {
            ConfigResponseDTO response = new ConfigResponseDTO();
            response.setIdConfig(config.getIdConfig());
            response.setClue(config.getClue());
            response.setValue(config.getValue());
            response.setDescription(config.getDescription());
            response.setModifiedBy(config.getModifiedBy());
            response.setModifiedDate(config.getModifiedDate());
            list.add(response);
        }
        return list;
    }

    public Optional<ConfigResponseDTO> getByClue(String clue) {
        Optional<Config> optionalConfig = configRepository.findByClue(clue);

        if (optionalConfig.isPresent()) {
            Config config = optionalConfig.get();

            ConfigResponseDTO response = new ConfigResponseDTO();
            response.setIdConfig(config.getIdConfig());
            response.setClue(config.getClue());
            response.setValue(config.getValue());
            response.setDescription(config.getDescription());
            response.setModifiedBy(config.getModifiedBy());
            response.setModifiedDate(config.getModifiedDate());

            return Optional.of(response);
        } else {
            return Optional.empty();
        }
    }

    public Optional<ConfigResponseDTO> update(Long id, ConfigRequestDTO dto) {
        Optional<Config> optionalConfig = configRepository.findById(id);

        if (optionalConfig.isPresent()) {
            Config config = optionalConfig.get();
            config.setClue(dto.getClue());
            config.setValue(dto.getValue());
            config.setDescription(dto.getDescription());
            config.setModifiedBy(dto.getModifiedBy());
            config.setModifiedDate(LocalDateTime.now());

            Config updated = configRepository.save(config);

            ConfigResponseDTO response = new ConfigResponseDTO();
            response.setIdConfig(updated.getIdConfig());
            response.setClue(updated.getClue());
            response.setValue(updated.getValue());
            response.setDescription(updated.getDescription());
            response.setModifiedBy(updated.getModifiedBy());
            response.setModifiedDate(updated.getModifiedDate());

            return Optional.of(response);
        } else {
            return Optional.empty();
        }
    }
}
