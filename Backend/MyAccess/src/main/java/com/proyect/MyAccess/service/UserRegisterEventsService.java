package com.proyect.MyAccess.service;

import com.proyect.MyAccess.dto.UserRegisterEventsRequestsDTO;
import com.proyect.MyAccess.dto.UserRegisterEventsResponseDTO;
import com.proyect.MyAccess.entity.UserRegisterEvents;
import com.proyect.MyAccess.entity.UserRegisterProfile;
import com.proyect.MyAccess.repository.UserRegisterEventsRepository;
import com.proyect.MyAccess.repository.UserRegisterProfileRepository;
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
        user.setTipeEvent(userDTO.getTipeEvent());
        user.setProcessed(userDTO.getProcessed());
        user.setEventDate(userDTO.getEventDate());
        user.setUserProfile(userProfile);

        UserRegisterEvents saved = userEventsRepository.save(user);

        UserRegisterEventsResponseDTO response = new UserRegisterEventsResponseDTO();
        response.setId(saved.getId());
        response.setEventDate(saved.getEventDate());
        response.setTipeEvent(saved.getTipeEvent());
        response.setProcessed(saved.getProcessed());
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
            dto.setTipeEvent(event.getTipeEvent());
            dto.setProcessed(event.getProcessed());

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
        response.setTipeEvent(event.getTipeEvent());
        response.setProcessed(event.getProcessed());

        if (event.getUserProfile() != null) {
            response.setIdUser(event.getUserProfile().getId());
        }

        return response;
    }


    public UserRegisterEventsResponseDTO update(Long id, UserRegisterEventsRequestsDTO userDTO) {
        UserRegisterEvents event = userEventsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El evento " + id + " no existe"));
        event.setTipeEvent(userDTO.getTipeEvent());
        event.setProcessed(userDTO.getProcessed());
        event.setEventDate(userDTO.getEventDate());


        if (userDTO.getIdUser() != null) {
            UserRegisterProfile userProfile = userProfileRepository.findById(userDTO.getIdUser())
                    .orElseThrow(() -> new RuntimeException("El usuario " + userDTO.getIdUser() + " no existe"));
            event.setUserProfile(userProfile);
        }

        UserRegisterEvents updated = userEventsRepository.save(event);

        UserRegisterEventsResponseDTO response = new UserRegisterEventsResponseDTO();
        response.setId(updated.getId());
        response.setEventDate(updated.getEventDate());
        response.setTipeEvent(updated.getTipeEvent());
        response.setProcessed(updated.getProcessed());

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
}