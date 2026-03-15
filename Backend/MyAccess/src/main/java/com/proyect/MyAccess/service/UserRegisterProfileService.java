package com.proyect.MyAccess.service;

import com.proyect.MyAccess.dto.UserRegisterProfileRequestDTO;
import com.proyect.MyAccess.dto.UserRegisterProfileResponseDTO;
import com.proyect.MyAccess.entity.UserRegisterProfile;
import com.proyect.MyAccess.repository.UserRegisterProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class UserRegisterProfileService {

    private final UserRegisterProfileRepository userRepository;

    public UserRegisterProfileResponseDTO userCreated(UserRegisterProfileRequestDTO userRequestDTO) {
        UserRegisterProfile user = new UserRegisterProfile();
        user.setDocument(userRequestDTO.getDocument());
        user.setName(userRequestDTO.getName());
        user.setLastName(userRequestDTO.getLastName());
        user.setPhone(userRequestDTO.getPhone());
        user.setNameRole(userRequestDTO.getNameRole());
        user.setRegional(userRequestDTO.getRegional());
        user.setBloodType(userRequestDTO.getBloodType());
        user.setTokenNumber(userRequestDTO.getTokenNumber());
        user.setTrainingCenter(userRequestDTO.getTrainingCenter());
        user.setTrainingProgram(userRequestDTO.getTrainingProgram());
        user.setEmail(userRequestDTO.getEmail());
        user.setPassword(userRequestDTO.getPassword());

        UserRegisterProfile saved = userRepository.save(user);

        UserRegisterProfileResponseDTO response = new UserRegisterProfileResponseDTO();
        response.setId(saved.getId());
        response.setDocument(saved.getDocument());
        response.setName(saved.getName());
        response.setLastName(saved.getLastName());
        response.setEmail(saved.getEmail());
        response.setPhone(saved.getPhone());
        response.setNameRole(saved.getNameRole());
        response.setRegional(saved.getRegional());
        response.setTrainingCenter(saved.getTrainingCenter());
        response.setTokenNumber(saved.getTokenNumber());
        response.setBloodType(saved.getBloodType());
        response.setTrainingProgram(saved.getTrainingProgram());
        response.setPassword(saved.getPassword());

        return response;
    }


    public List<UserRegisterProfileResponseDTO> getUsuarios() {
        List<UserRegisterProfile> users = userRepository.findAll();
        List<UserRegisterProfileResponseDTO> list = new ArrayList<>();

        for (UserRegisterProfile user : users) {
            UserRegisterProfileResponseDTO response = new UserRegisterProfileResponseDTO();
            response.setId(user.getId());
            response.setDocument(user.getDocument());
            response.setName(user.getName());
            response.setLastName(user.getLastName());
            response.setEmail(user.getEmail());
            response.setPhone(user.getPhone());
            response.setNameRole(user.getNameRole());
            response.setPassword(user.getPassword());
            response.setRegional(user.getRegional());
            response.setTokenNumber(user.getTokenNumber());
            response.setTrainingCenter(user.getTrainingCenter());
            response.setBloodType(user.getBloodType());
            response.setTrainingProgram(user.getTrainingProgram());
            list.add(response);
        }
        return list;
    }


    public List<UserRegisterProfileResponseDTO> getForNameRol(String nameRole) {
        List<UserRegisterProfile> users = userRepository.findByNameRole(nameRole);
        List<UserRegisterProfileResponseDTO> response = new ArrayList<>();

        for (UserRegisterProfile user : users) {
            UserRegisterProfileResponseDTO responseDTO = new UserRegisterProfileResponseDTO();
            responseDTO.setId(user.getId());
            responseDTO.setDocument(user.getDocument());
            responseDTO.setName(user.getName());
            responseDTO.setLastName(user.getLastName());
            responseDTO.setEmail(user.getEmail());
            responseDTO.setPhone(user.getPhone());
            responseDTO.setPassword(user.getPassword());
            responseDTO.setNameRole(user.getNameRole());
            responseDTO.setTrainingProgram(user.getTrainingProgram());
            responseDTO.setTokenNumber(user.getTokenNumber());
            responseDTO.setTrainingCenter(user.getTrainingCenter());
            responseDTO.setBloodType(user.getBloodType());
            responseDTO.setRegional(user.getRegional());
            response.add(responseDTO);
        }
        return response;
    }


    public List<UserRegisterProfileResponseDTO> getForDocument(String document) {
        List<UserRegisterProfile> users = userRepository.findByDocument(document);
        List<UserRegisterProfileResponseDTO> response = new ArrayList<>();

        for (UserRegisterProfile user : users) {
            UserRegisterProfileResponseDTO responseDTO = new UserRegisterProfileResponseDTO();
            responseDTO.setId(user.getId());
            responseDTO.setDocument(user.getDocument());
            responseDTO.setName(user.getName());
            responseDTO.setLastName(user.getLastName());
            responseDTO.setEmail(user.getEmail());
            responseDTO.setPassword(user.getPassword());
            responseDTO.setPhone(user.getPhone());
            responseDTO.setNameRole(user.getNameRole());
            responseDTO.setRegional(user.getRegional());
            responseDTO.setTokenNumber(user.getTokenNumber());
            responseDTO.setBloodType(user.getBloodType());
            responseDTO.setTrainingCenter(user.getTrainingCenter());
            responseDTO.setTrainingProgram(user.getTrainingProgram());
            response.add(responseDTO);
        }
        return response;
    }

    public Optional<UserRegisterProfileResponseDTO> updateUser(Long id, UserRegisterProfileRequestDTO userRequestDTO) {
        Optional<UserRegisterProfile> optionalUser = userRepository.findById(id);

        if (optionalUser.isPresent()) {
            UserRegisterProfile user = optionalUser.get();
            user.setDocument(userRequestDTO.getDocument());
            user.setName(userRequestDTO.getName());
            user.setLastName(userRequestDTO.getLastName());
            user.setPhone(userRequestDTO.getPhone());
            user.setEmail(userRequestDTO.getEmail());
            user.setPassword(userRequestDTO.getPassword());
            user.setTokenNumber(userRequestDTO.getTokenNumber());
            user.setRegional(userRequestDTO.getRegional());
            user.setNameRole(userRequestDTO.getNameRole());
            user.setTrainingProgram(userRequestDTO.getTrainingProgram());
            user.setTrainingCenter(userRequestDTO.getTrainingCenter());
            user.setBloodType(userRequestDTO.getBloodType());

            UserRegisterProfile updatedUser = userRepository.save(user);

            UserRegisterProfileResponseDTO response = new UserRegisterProfileResponseDTO();
            response.setId(updatedUser.getId());
            response.setDocument(updatedUser.getDocument());
            response.setName(updatedUser.getName());
            response.setLastName(updatedUser.getLastName());
            response.setEmail(updatedUser.getEmail());
            response.setPhone(updatedUser.getPhone());
            response.setPassword(updatedUser.getPassword());
            response.setBloodType(updatedUser.getBloodType());
            response.setTrainingCenter(updatedUser.getTrainingCenter());
            response.setTrainingProgram(updatedUser.getTrainingProgram());
            response.setTokenNumber(updatedUser.getTokenNumber());
            response.setNameRole(updatedUser.getNameRole());
            response.setRegional(updatedUser.getRegional());

            return Optional.of(response);
        } else {
            return Optional.empty();
        }
    }

    public Optional<UserRegisterProfileResponseDTO> updateUserForDocument(String document, UserRegisterProfileRequestDTO userRequestDTO) {
        List<UserRegisterProfile> users = userRepository.findByDocument(document);

        if (users.isEmpty()) {
            return Optional.empty();
        }

        UserRegisterProfile user = users.get(0);

        user.setDocument(userRequestDTO.getDocument());
        user.setName(userRequestDTO.getName());
        user.setLastName(userRequestDTO.getLastName());
        user.setEmail(userRequestDTO.getEmail());
        user.setPhone(userRequestDTO.getPhone());
        user.setPassword(userRequestDTO.getPassword());
        user.setNameRole(userRequestDTO.getNameRole());
        user.setTokenNumber(userRequestDTO.getTokenNumber());
        user.setTrainingProgram(userRequestDTO.getTrainingProgram());
        user.setTrainingCenter(userRequestDTO.getTrainingCenter());
        user.setRegional(userRequestDTO.getRegional());
        user.setBloodType(userRequestDTO.getBloodType());

        UserRegisterProfile updatedUser = userRepository.save(user);

        UserRegisterProfileResponseDTO response = new UserRegisterProfileResponseDTO();
        response.setId(updatedUser.getId());
        response.setDocument(updatedUser.getDocument());
        response.setName(updatedUser.getName());
        response.setLastName(updatedUser.getLastName());
        response.setEmail(updatedUser.getEmail());
        response.setPassword(updatedUser.getPassword());
        response.setPhone(updatedUser.getPhone());
        response.setNameRole(updatedUser.getNameRole());
        response.setTokenNumber(updatedUser.getTokenNumber());
        response.setTrainingProgram(updatedUser.getTrainingProgram());
        response.setTrainingCenter(updatedUser.getTrainingCenter());
        response.setRegional(updatedUser.getRegional());
        response.setBloodType(updatedUser.getBloodType());

        return Optional.of(response);
    }

    public boolean deleteUserDoc(String document) {
        List<UserRegisterProfile> users = userRepository.findByDocument(document);

        if (!users.isEmpty()) {
            userRepository.delete(users.get(0));
            return true;
        }
        return false;
    }
}