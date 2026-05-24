package com.proyect.user_service.service;

import com.proyect.user_service.dto.UserRegisterProfileRequestDTO;
import com.proyect.user_service.dto.UserRegisterProfileResponseDTO;
import com.proyect.user_service.entity.UserRegisterProfile;
import com.proyect.user_service.repository.UserRegisterProfileRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
@Transactional
public class UserRegisterProfileService {

    private final UserRegisterProfileRepository userRepository;

    public void validateRegistrationAvailable(String email, String document) {
        if (email != null && userRepository.existsByEmail(email)) {
            throw new RuntimeException("El email ya esta registrado");
        }
        if (document != null && userRepository.existsByDocument(document)) {
            throw new RuntimeException("El documento ya esta registrado");
        }
    }

    public UserRegisterProfileResponseDTO userCreated(UserRegisterProfileRequestDTO dto) {

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
        if (dto.getDocument() != null)        user.setDocument(dto.getDocument());
        if (dto.getTypeDocument() != null)    user.setTypeDocument(dto.getTypeDocument());
        if (dto.getFullName() != null)        user.setFullName(dto.getFullName());
        if (dto.getTrainingProgram() != null) user.setTrainingProgram(dto.getTrainingProgram());
        if (dto.getTrainingCenter() != null)  user.setTrainingCenter(dto.getTrainingCenter());
        if (dto.getRegional() != null)        user.setRegional(dto.getRegional());
        if (dto.getBloodType() != null)       user.setBloodType(dto.getBloodType());
        if (dto.getNameRole() != null)        user.setNameRole(dto.getNameRole());
        if (dto.getFicha() != null)           user.setFicha(dto.getFicha());
        if (dto.getEmail() != null)           user.setEmail(dto.getEmail());
        if (dto.getPhotoUrl() != null)        user.setPhotoUrl(dto.getPhotoUrl());
    }

    public Optional<UserRegisterProfileResponseDTO> uploadPhoto(String document, MultipartFile photo) throws IOException {
        List<UserRegisterProfile> users = userRepository.findByDocument(document);
        if (users.isEmpty()) return Optional.empty();
        UserRegisterProfile user = users.get(0);
        String filename = UUID.randomUUID() + getImageExtension(photo);
        Path uploadDir = Paths.get("uploads");
        Files.createDirectories(uploadDir);
        Files.write(uploadDir.resolve(filename), photo.getBytes());
        user.setPhotoUrl("/uploads/" + filename);
        return Optional.of(toResponse(userRepository.save(user)));
    }

    private String getImageExtension(MultipartFile photo) {
        String contentType = photo.getContentType();
        if ("image/png".equalsIgnoreCase(contentType)) return ".png";
        if ("image/webp".equalsIgnoreCase(contentType)) return ".webp";
        if ("image/gif".equalsIgnoreCase(contentType)) return ".gif";
        if ("image/jpeg".equalsIgnoreCase(contentType) || "image/jpg".equalsIgnoreCase(contentType)) return ".jpg";

        String originalFilename = photo.getOriginalFilename();
        if (originalFilename != null) {
            String lowerName = originalFilename.toLowerCase();
            if (lowerName.endsWith(".png")) return ".png";
            if (lowerName.endsWith(".webp")) return ".webp";
            if (lowerName.endsWith(".gif")) return ".gif";
            if (lowerName.endsWith(".jpeg")) return ".jpg";
            if (lowerName.endsWith(".jpg")) return ".jpg";
        }

        return ".jpg";
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
        r.setPhotoUrl(user.getPhotoUrl());
        return r;
    }
}
