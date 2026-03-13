package com.proyect.MyAccess.service;

import com.proyect.MyAccess.dto.UserProfileRequestDTO;
import com.proyect.MyAccess.dto.UserProfileResponseDTO;
import com.proyect.MyAccess.entity.UserProfile;
import com.proyect.MyAccess.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@RequiredArgsConstructor
@Service
public class UserProfileService {
    private final UserProfileRepository userRepository;

    // controlador
    // endpoint para registrar usuarios
    public UserProfileRequestDTO userCreated(UserProfileRequestDTO userRequestDTO) {
        UserProfile user = new UserProfile();
        user.setDocument(userRequestDTO.getDocument());
        user.setName(userRequestDTO.getName());
        user.setLastName(userRequestDTO.getLastName());
        user.setPhone(userRequestDTO.getPhone());
        user.setNameRole(userRequestDTO.getNameRole());
        user.setRegional(userRequestDTO.getRegional());
    //    user.setBloodTipe(userRequestDTO.getBloodType());
        user.setTokenNumber(userRequestDTO.getTokenNumber());
        user.setTrainingCenter(userRequestDTO.getTrainingCenter());
        user.setTreainingProgram(userRequestDTO.getTrainingProgram());
        user.setEmail(userRequestDTO.getEmail());
        user.setPassword(userRequestDTO.getPassword());

        userRepository.save(user);

        UserProfileRequestDTO userResponseDTO = new UserProfileRequestDTO();
        userResponseDTO.setDocument(user.getDocument());
        userResponseDTO.setName(user.getName());
        userResponseDTO.setLastName(user.getLastName());
        userResponseDTO.setEmail(user.getEmail());
        userResponseDTO.setPhone(user.getPhone());
        userResponseDTO.setNameRole(user.getNameRole());
        userResponseDTO.setRegional(user.getRegional());
        userResponseDTO.setTrainingCenter(user.getTrainingCenter());
        userResponseDTO.setTokenNumber(user.getTokenNumber());
        // userResponseDTO.setBloodType(user.getBloodType);
        userResponseDTO.setTrainingProgram(user.getTreainingProgram());
        userResponseDTO.setPassword(user.getPassword());
        userResponseDTO.setEmail(user.getEmail());


        return userResponseDTO ;
    }

    //Endpoint para listar usuarios registrados

    public List <UserProfileResponseDTO> getUsuarios(){
        List<UserProfile> User =userRepository.findAll();
        List<UserProfileResponseDTO> list = new ArrayList<>();

        for (UserProfile user: User ){
            UserProfileResponseDTO userResponseDTO = new UserProfileResponseDTO();
            userResponseDTO.setDocument(user.getDocument());
            userResponseDTO.setName(user.getName());
            userResponseDTO.setLastName(user.getLastName());
            userResponseDTO.setEmail(user.getEmail());
            userResponseDTO.setPhone(user.getPhone());
            userResponseDTO.setNameRole(user.getNameRole());
            userResponseDTO.setPassword(user.getPassword());
            userResponseDTO.setRegional(user.getRegional());
            userResponseDTO.setTokenNumber(user.getTokenNumber());
            userResponseDTO.setTrainingCenter(user.getTrainingCenter());
            userResponseDTO.setTrainingProgram(user.getTreainingProgram());
            userResponseDTO.setNameRole(user.getNameRole());
            list.add(userResponseDTO);
        }
        return list;
    }

    // endpoint para listar los usuarios mediante su rol
    public List<UserProfileResponseDTO> getForNameRol (String namesRol){
        List <UserProfile> users = userRepository.findByNameRole(namesRol);

        List<UserProfileResponseDTO> response = new ArrayList<>();
        for (UserProfile user :users){

            UserProfileResponseDTO responseDTO = new UserProfileResponseDTO();
            responseDTO.setId(user.getId());
            responseDTO.setDocument(user.getDocument());
            responseDTO.setName(user.getName());
            responseDTO.setLastName(user.getLastName());
            responseDTO.setEmail(user.getEmail());
            responseDTO.setPhone(user.getPhone());
            responseDTO.setPassword(user.getPassword());
            responseDTO.setNameRole(user.getNameRole());
            responseDTO.setTrainingProgram(user.getTreainingProgram());
            responseDTO.setTokenNumber(user.getTokenNumber());
            responseDTO.setTrainingCenter(user.getTrainingCenter());
            responseDTO.setRegional(user.getRegional());
        }
        return  response;
    }

    // endpoint para actualizar usuario por id

    public Optional <UserProfileResponseDTO> updateUser(Long id, UserProfileResponseDTO userRequestDTO){
        Optional<UserProfile> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()){
            UserProfile user = (UserProfile) optionalUser.get();
            user.setDocument(userRequestDTO.getDocument());
            user.setName(userRequestDTO.getName());
            user.setLastName(userRequestDTO.getLastName());
            user.setPhone(userRequestDTO.getPhone());
            user.setEmail(userRequestDTO.getEmail());
            user.setTokenNumber(userRequestDTO.getTokenNumber());
            user.setTrainingCenter(userRequestDTO.getTrainingCenter());
        //    user.setBloodTipe(userRequestDTO.getBloodType());
            user.setRegional(userRequestDTO.getRegional());
            user.setNameRole(userRequestDTO.getNameRole());
            user.setPassword(userRequestDTO.getPassword());
            UserProfile updateUser = userRepository.save(user);

            UserProfileResponseDTO response = new UserProfileResponseDTO();
            response.setId(updateUser.getId());
            response.setDocument(updateUser.getDocument());
            response.setName(updateUser.getName());
            response.setLastName(updateUser.getLastName());
            response.setEmail(updateUser.getEmail());
            response.setPhone(updateUser.getPhone());
            response.setRegional(updateUser.getRegional());
       //     response.setBloodType(updateUser.getBloodTipe());
            response.setPassword(updateUser.getPassword());
            response.setNameRole(updateUser.getNameRole());
            response.setTrainingCenter(updateUser.getTrainingCenter());
            response.setTrainingProgram(updateUser.getTreainingProgram());
            response.setRegional(updateUser.getRegional());


            return  Optional.of(response);
        }else {
            return Optional.empty();
        }
    }

    // endpoint para eliminar un usuario por id
    public boolean deleteUserid(Long id){
        if (userRepository.existsById(id)){
            userRepository.deleteById(id);
            return  true;
        }
        return  false;
    }

    // por documento
    // endpoint para mostrar los datos mediante el documento
    public List <UserProfileResponseDTO>getfordocument(String document){
        List<UserProfile> users = userRepository.findByDocument(document);
        List<UserProfileResponseDTO> response = new ArrayList<>();
        for (UserProfile user : users){
            UserProfileResponseDTO responseDTO = new UserProfileResponseDTO();
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
        //    responseDTO.setBloodType(user.getBloodTipe());
            responseDTO.setTrainingCenter(user.getTrainingCenter());
            responseDTO.setTrainingProgram(user.getTreainingProgram());
        }
        return response;

    }

    //endpoint para actualizar por documento

    public Optional<UserProfileResponseDTO> updateUserForDocument(String document, UserProfileRequestDTO userRequestDTO) {
        List<UserProfile> users = userRepository.findByDocument(document);

        if (users.isEmpty()) {
            return Optional.empty();
        }

        UserProfile user = (UserProfile) users.get(0);
        user.setDocument(userRequestDTO.getDocument());
        user.setName(userRequestDTO.getName());
        user.setLastName(userRequestDTO.getLastName());
        user.setEmail(userRequestDTO.getEmail());
        user.setPhone(userRequestDTO.getPhone());
        user.setPassword(userRequestDTO.getPassword());
        user.setNameRole(userRequestDTO.getNameRole());
        user.setTokenNumber(userRequestDTO.getTokenNumber());
        user.setTreainingProgram(userRequestDTO.getTrainingProgram());
        user.setTrainingCenter(userRequestDTO.getTrainingCenter());
        user.setRegional(userRequestDTO.getRegional());
    //    user.setBloodTipe(userRequestDTO.getBloodType());

        UserProfile updatedUser = userRepository.save(user);

        UserProfileResponseDTO response = new UserProfileResponseDTO();
        response.setDocument(updatedUser.getDocument());
        response.setName(updatedUser.getName());
        response.setLastName(updatedUser.getLastName());
        response.setEmail(updatedUser.getEmail());
        response.setPassword(updatedUser.getPassword());
        response.setPhone(updatedUser.getPhone());
        response.setNameRole(updatedUser.getNameRole());
        response.setTokenNumber(updatedUser.getTokenNumber());
        response.setTrainingProgram(updatedUser.getTreainingProgram());
        response.setTrainingCenter(updatedUser.getTrainingCenter());
        response.setRegional(updatedUser.getRegional());
    //    response.setBloodType(updatedUser.getBloodTipe());
        return Optional.of(response);
    }

    // enpoint para eliminar un usuario por el documento

    public  boolean deleteUserdoc(String document){
        List<UserProfile> users = userRepository.findByDocument(document);
        if(!users.isEmpty()){
            userRepository.delete(users.get(0));
            return true;
        }
        return false;
    }
}

