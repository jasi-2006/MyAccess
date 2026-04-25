package com.proyect.MyAccess.user_service.service;

import com.proyect.MyAccess.user_service.dto.UserRegisterEventsRequestsDTO;
import com.proyect.MyAccess.user_service.dto.UserRegisterEventsResponseDTO;
import com.proyect.MyAccess.user_service.entity.UserRegisterEvents;
import com.proyect.MyAccess.user_service.entity.UserRegisterProfile;
import com.proyect.MyAccess.user_service.repository.UserRegisterEventsRepository;
import com.proyect.MyAccess.user_service.repository.UserRegisterProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserRegisterEventsService {

    private final UserRegisterEventsRepository userEventsRepository;
    private final UserRegisterProfileRepository userProfileRepository;


    public UserRegisterEventsResponseDTO create(UserRegisterEventsRequestsDTO userDTO) {
        UserRegisterProfile userProfile = userProfileRepository.findById(userDTO.getIdUser())
                .orElseThrow(() -> new RuntimeException("El usuario " + userDTO.getIdUser() + " no existe"));
        UserRegisterEvents user = new UserRegisterEvents();
        user.setTypeEvent(userDTO.getTypeEvent());
        user.setProcessed(userDTO.getProcessed());
        user.setEventDate(userDTO.getEventDate());
        user.setDescription(userDTO.getDescription());
        user.setUserProfile(userProfile);

        userEventsRepository.save(user);

        UserRegisterEventsResponseDTO response = new UserRegisterEventsResponseDTO();
        response.setId(user.getId());
        response.setEventDate(userDTO.getEventDate());
        response.setTypeEvent(userDTO.getTypeEvent());
        response.setProcessed(userDTO.getProcessed());
        response.setDescription(userDTO.getDescription());
        response.setIdUser(userProfile.getId());

        return response;
    }


    public List<UserRegisterEventsResponseDTO> getAll() {
        List<UserRegisterEvents> events = userEventsRepository.findAll();
        List<UserRegisterEventsResponseDTO> responseList = new ArrayList<>();

        for (UserRegisterEvents event : events) {
            UserRegisterEventsResponseDTO dto = new UserRegisterEventsResponseDTO();
            dto.setId(event.getId());
            dto.setEventDate(event.getEventDate());
            dto.setTypeEvent(event.getTypeEvent());
            dto.setProcessed(event.getProcessed());
            dto.setDescription(event.getDescription());

            if (event.getUserProfile() != null) {
                dto.setIdUser(event.getUserProfile().getId());
            }

            responseList.add(dto);
        }
        return responseList;
    }


    public UserRegisterEventsResponseDTO getById(Long id) {
        UserRegisterEvents event = userEventsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El evento " + id + " no existe"));

        UserRegisterEventsResponseDTO response = new UserRegisterEventsResponseDTO();
        response.setId(event.getId());
        response.setEventDate(event.getEventDate());
        response.setTypeEvent(event.getTypeEvent());
        response.setProcessed(event.getProcessed());
        response.setDescription(event.getDescription());

        if (event.getUserProfile() != null) {
            response.setIdUser(event.getUserProfile().getId());
        }

        return response;
    }


    public UserRegisterEventsResponseDTO update(Long id, UserRegisterEventsRequestsDTO userDTO) {
        UserRegisterEvents event = userEventsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El evento " + id + " no existe"));
        event.setTypeEvent(userDTO.getTypeEvent());
        event.setProcessed(userDTO.getProcessed());
        event.setEventDate(userDTO.getEventDate());
        event.setDescription(userDTO.getDescription());


        if (userDTO.getIdUser() != null) {
            UserRegisterProfile userProfile = userProfileRepository.findById(userDTO.getIdUser())
                    .orElseThrow(() -> new RuntimeException("El usuario " + userDTO.getIdUser() + " no existe"));
            event.setUserProfile(userProfile);
        }

        UserRegisterEvents updated = userEventsRepository.save(event);

        UserRegisterEventsResponseDTO response = new UserRegisterEventsResponseDTO();
        response.setId(updated.getId());
        response.setEventDate(updated.getEventDate());
        response.setTypeEvent(updated.getTypeEvent());
        response.setProcessed(updated.getProcessed());
        response.setDescription(updated.getDescription());

        if (updated.getUserProfile() != null) {
            response.setIdUser(updated.getUserProfile().getId());
        }

        return response;
    }


    public void delete(Long id) {
        if (!userEventsRepository.existsById(id)) {
            throw new RuntimeException("El evento " + id + " no existe");
        }
        userEventsRepository.deleteById(id);
    }

    public List<UserRegisterEventsResponseDTO> getByUserId(Long userId) {
        List<UserRegisterEvents> events = userEventsRepository.findByUserProfileId(userId);
        List<UserRegisterEventsResponseDTO> responseList = new ArrayList<>();

        for (UserRegisterEvents event : events) {
            UserRegisterEventsResponseDTO dto = new UserRegisterEventsResponseDTO();
            dto.setId(event.getId());
            dto.setEventDate(event.getEventDate());
            dto.setTypeEvent(event.getTypeEvent());
            dto.setProcessed(event.getProcessed());
            dto.setDescription(event.getDescription());
            if (event.getUserProfile() != null) {
                dto.setIdUser(event.getUserProfile().getId());
            }
            responseList.add(dto);
        }
        return responseList;
    }


}