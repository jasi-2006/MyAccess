package com.proyect.MyAccess.user_service.service;

import com.proyect.MyAccess.user_service.dto.UserRegisterProfileRequestDTO;
import com.proyect.MyAccess.user_service.dto.UserRegisterProfileResponseDTO;
import com.proyect.MyAccess.user_service.entity.UserRegisterProfile;
import com.proyect.MyAccess.user_service.repository.UserRegisterProfileRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
@Transactional
public class UserRegisterProfileService {

    private final UserRegisterProfileRepository userRepository;

    public UserRegisterProfileResponseDTO userCreated(UserRegisterProfileRequestDTO dto) {
        if (userRepository.existsByDocument(dto.getDocument())) {
            throw new RuntimeException("El documento ya está registrado");
        }
        UserRegisterProfile user = new UserRegisterProfile();
        applyUpdate(user, dto);
        userRepository.save(user);
        return toResponse(user);
    }

    public List<UserRegisterProfileResponseDTO> getUsuarios() {
        List<UserRegisterProfileResponseDTO> list = new ArrayList<>();
        for (UserRegisterProfile user : userRepository.findAll()) {
            list.add(toResponse(user));
        }
        return list;
    }

    public List<UserRegisterProfileResponseDTO> getForNameRol(String nameRole) {
        List<UserRegisterProfileResponseDTO> list = new ArrayList<>();
        for (UserRegisterProfile user : userRepository.findByNameRole(nameRole)) {
            list.add(toResponse(user));
        }
        return list;
    }

    public List<UserRegisterProfileResponseDTO> getForDocument(String document) {
        List<UserRegisterProfileResponseDTO> list = new ArrayList<>();
        for (UserRegisterProfile user : userRepository.findByDocument(document)) {
            list.add(toResponse(user));
        }
        return list;
    }

    public Optional<UserRegisterProfileResponseDTO> getByEmail(String email) {
        return userRepository.findByEmail(email).map(this::toResponse);
    }

    public Optional<UserRegisterProfileResponseDTO> updateUser(Long id, UserRegisterProfileRequestDTO dto) {
        return userRepository.findById(id).map(user -> {
            applyUpdate(user, dto);
            return toResponse(userRepository.save(user));
        });
    }

    public Optional<UserRegisterProfileResponseDTO> updateUserForDocument(String document, UserRegisterProfileRequestDTO dto) {
        List<UserRegisterProfile> users = userRepository.findByDocument(document);
        if (users.isEmpty()) return Optional.empty();
        UserRegisterProfile user = users.get(0);
        applyUpdate(user, dto);
        return Optional.of(toResponse(userRepository.save(user)));
    }

    public boolean deleteUserDoc(String document) {
        List<UserRegisterProfile> users = userRepository.findByDocument(document);
        if (!users.isEmpty()) {
            userRepository.delete(users.get(0));
            return true;
        }
        return false;
    }

    private void applyUpdate(UserRegisterProfile user, UserRegisterProfileRequestDTO dto) {
        user.setDocument(dto.getDocument());
        user.setTypeDocument(dto.getTypeDocument());
        user.setFullName(dto.getFullName());
        user.setTrainingProgram(dto.getTrainingProgram());
        user.setTrainingCenter(dto.getTrainingCenter());
        user.setRegional(dto.getRegional());
        user.setBloodType(dto.getBloodType());
        user.setNameRole(dto.getNameRole());
        user.setFicha(dto.getFicha());
        user.setEmail(dto.getEmail());
    }

    private UserRegisterProfileResponseDTO toResponse(UserRegisterProfile user) {
        UserRegisterProfileResponseDTO r = new UserRegisterProfileResponseDTO();
        r.setId(user.getId());
        r.setDocument(user.getDocument());
        r.setTypeDocument(user.getTypeDocument());
        r.setFullName(user.getFullName());
        r.setTrainingProgram(user.getTrainingProgram());
        r.setTrainingCenter(user.getTrainingCenter());
        r.setRegional(user.getRegional());
        r.setBloodType(user.getBloodType());
        r.setNameRole(user.getNameRole());
        r.setFicha(user.getFicha());
        r.setEmail(user.getEmail());
        return r;
    }
}
