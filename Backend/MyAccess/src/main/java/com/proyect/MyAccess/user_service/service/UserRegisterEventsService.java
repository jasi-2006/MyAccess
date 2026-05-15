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

/*
 * Servicio para gestionar los eventos de registro de usuarios.
 * Permite crear, consultar, actualizar y eliminar eventos asociados a perfiles de usuario.
 */
@Service
@RequiredArgsConstructor
public class UserRegisterEventsService {

    private final UserRegisterEventsRepository userEventsRepository;
    private final UserRegisterProfileRepository userProfileRepository;

    /*
     * Crea y persiste un nuevo evento de registro asociado a un perfil de usuario.
     * @param dto Datos del evento, incluyendo el idUser del perfil asociado
     * @return UserRegisterEventsResponseDTO con los datos del evento creado
     */
    public UserRegisterEventsResponseDTO create(UserRegisterEventsRequestsDTO dto) {
        UserRegisterProfile userProfile = userProfileRepository.findById(dto.getIdUser())
                .orElseThrow(() -> new RuntimeException("El usuario " + dto.getIdUser() + " no existe"));
        UserRegisterEvents event = new UserRegisterEvents();
        event.setTipeEvent(dto.getTipeEvent());
        event.setProcessed(dto.getProcessed());
        event.setEventDate(dto.getEventDate());
        event.setDescriptions(dto.getDescriptions());
        event.setUserProfile(userProfile);
        userEventsRepository.save(event);
        return toResponse(event);
    }

    /*
     * Retorna todos los eventos de registro del sistema.
     * @return Lista de UserRegisterEventsResponseDTO con todos los eventos
     */
    public List<UserRegisterEventsResponseDTO> getAll() {
        List<UserRegisterEventsResponseDTO> list = new ArrayList<>();
        for (UserRegisterEvents event : userEventsRepository.findAll()) {
            list.add(toResponse(event));
        }
        return list;
    }

    /*
     * Busca un evento de registro por su ID.
     * @param id Identificador del evento a buscar
     * @return UserRegisterEventsResponseDTO con los datos del evento encontrado
     */
    public UserRegisterEventsResponseDTO getById(Long id) {
        return toResponse(userEventsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El evento " + id + " no existe")));
    }

    /*
     * Actualiza los datos de un evento existente por su ID.
     * Si se proporciona idUser, actualiza también el perfil de usuario asociado.
     * @param id Identificador del evento a actualizar
     * @param dto Nuevos datos del evento
     * @return UserRegisterEventsResponseDTO con los datos del evento actualizado
     */
    public UserRegisterEventsResponseDTO update(Long id, UserRegisterEventsRequestsDTO dto) {
        UserRegisterEvents event = userEventsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El evento " + id + " no existe"));
        event.setTipeEvent(dto.getTipeEvent());
        event.setProcessed(dto.getProcessed());
        event.setEventDate(dto.getEventDate());
        event.setDescriptions(dto.getDescriptions());
        if (dto.getIdUser() != null) {
            UserRegisterProfile userProfile = userProfileRepository.findById(dto.getIdUser())
                    .orElseThrow(() -> new RuntimeException("El usuario " + dto.getIdUser() + " no existe"));
            event.setUserProfile(userProfile);
        }
        return toResponse(userEventsRepository.save(event));
    }

    /*
     * Elimina un evento de registro por su ID.
     * @param id Identificador del evento a eliminar
     */
    public void delete(Long id) {
        if (!userEventsRepository.existsById(id)) {
            throw new RuntimeException("El evento " + id + " no existe");
        }
        userEventsRepository.deleteById(id);
    }

    /*
     * Retorna todos los eventos asociados a un usuario específico.
     * @param userId Identificador del perfil de usuario
     * @return Lista de UserRegisterEventsResponseDTO con los eventos del usuario
     */
    public List<UserRegisterEventsResponseDTO> getByUserId(Long userId) {
        List<UserRegisterEventsResponseDTO> list = new ArrayList<>();
        for (UserRegisterEvents event : userEventsRepository.findByUserProfileId(userId)) {
            list.add(toResponse(event));
        }
        return list;
    }

    /*
     * Convierte una entidad UserRegisterEvents en su DTO de respuesta.
     * @param event Entidad de evento a convertir
     * @return UserRegisterEventsResponseDTO con los datos mapeados
     */
    private UserRegisterEventsResponseDTO toResponse(UserRegisterEvents event) {
        UserRegisterEventsResponseDTO r = new UserRegisterEventsResponseDTO();
        r.setId(event.getId());
        r.setTipeEvent(event.getTipeEvent());
        r.setProcessed(event.getProcessed());
        r.setEventDate(event.getEventDate());
        r.setDescriptions(event.getDescriptions());
        if (event.getUserProfile() != null) {
            r.setIdUser(event.getUserProfile().getId());
        }
        return r;
    }
}
