package com.proyect.MyAccess.service;


import com.proyect.MyAccess.dto.RoleResponseDTO;
import com.proyect.MyAccess.dto.UserRequestDTO;
import com.proyect.MyAccess.dto.UserResponseDTO;
import com.proyect.MyAccess.entity.Role;
import com.proyect.MyAccess.entity.User;
import com.proyect.MyAccess.repository.RoleRepository;
import com.proyect.MyAccess.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@RequiredArgsConstructor
@Service
public class UserService {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    // controlador
    // endpoint para registrar usuarios
    public UserResponseDTO userCreated(UserRequestDTO userRequestDTO) {
        User user = new User();
        user.setDocument(userRequestDTO.getDocument());
        user.setName(userRequestDTO.getName());
        user.setLastName(userRequestDTO.getLastName());
        user.setEmail(userRequestDTO.getEmail());
        user.setPassword(userRequestDTO.getPassword());
        user.setPhone(userRequestDTO.getPhone());
        Role role = roleRepository.findByNameRole(userRequestDTO.getRole())
                .orElseThrow(()-> new RuntimeException("el rol"+userRequestDTO.getRole()+" no existe"));
        user.setRole(role);

        userRepository.save(user);

        UserResponseDTO userResponseDTO = new UserResponseDTO();
        userResponseDTO.setId(user.getId());
        userResponseDTO.setDocument(user.getDocument());
        userResponseDTO.setName(user.getName());
        userResponseDTO.setLastName(user.getLastName());
        userResponseDTO.setEmail(user.getEmail());
        userResponseDTO.setPassword(user.getPassword());
        userResponseDTO.setPhone(user.getPhone());
        if (user.getRole() != null){
            RoleResponseDTO roleDTO = new  RoleResponseDTO();
            roleDTO.setId(user.getRole().getId());
            roleDTO.setNameRole(user.getRole().getNameRole());
            userResponseDTO.setRole(roleDTO);
        }
        return userResponseDTO ;
    }

    //Endpoint para listar usuarios registrados

    public List <UserResponseDTO> getUsuarios(){
        List<User> User = userRepository.findAll();
        List<UserResponseDTO> list = new ArrayList<>();

        for (User user: User ){
            UserResponseDTO userResponseDTO = new UserResponseDTO();
            userResponseDTO.setId(user.getId());
            userResponseDTO.setDocument(user.getDocument());
            userResponseDTO.setName(user.getName());
            userResponseDTO.setLastName(user.getLastName());
            userResponseDTO.setPassword(user.getPassword());
            userResponseDTO.setEmail(user.getEmail());
            userResponseDTO.setPhone(user.getPhone());
            if(user.getRole()!=null){
                RoleResponseDTO roleDTO = new RoleResponseDTO();
                roleDTO.setId(user.getRole().getId());
                roleDTO.setNameRole(user.getRole().getNameRole());
                userResponseDTO.setRole(roleDTO);
            }
            else {
                userResponseDTO.setRole(null);
            }
            list.add(userResponseDTO);
        }
        return list;
    }

    // endpoint para listar los usuarios mediante su rol
    public List<UserResponseDTO> getForNameRol (String namesRol){
        List <User> users = userRepository.findByRole_NameRole(namesRol);

        List<UserResponseDTO> response = new ArrayList<>();
        for (User user :users){

            UserResponseDTO responseDTO = new UserResponseDTO();
            responseDTO.setId(user.getId());
            responseDTO.setDocument(user.getDocument());
            responseDTO.setName(user.getName());
            responseDTO.setLastName(user.getLastName());
            responseDTO.setEmail(user.getEmail());
            responseDTO.setPhone(user.getPhone());
            responseDTO.setPassword(user.getPassword());

            RoleResponseDTO roleDTO = new RoleResponseDTO();
            roleDTO.setId(user.getId());
            roleDTO.setNameRole(user.getRole().getNameRole());
            responseDTO.setRole(roleDTO);

            response.add(responseDTO);
        }
        return  response;
    }

    // endpoint para actualizar usuario por id

    public Optional <UserResponseDTO> updateUser(Long id, UserRequestDTO userRequestDTO){
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()){
            User user = optionalUser.get();
            user.setDocument(userRequestDTO.getDocument());
            user.setName(userRequestDTO.getName());
            user.setLastName(userRequestDTO.getLastName());
            user.setPhone(userRequestDTO.getPhone());
            user.setEmail(userRequestDTO.getEmail());
            user.setPassword(userRequestDTO.getPassword());

            User updateUser = userRepository.save(user);

            UserResponseDTO response = new UserResponseDTO();
            response.setId(updateUser.getId());
            response.setDocument(updateUser.getDocument());
            response.setName(updateUser.getName());
            response.setLastName(updateUser.getLastName());
            response.setEmail(updateUser.getEmail());
            response.setPhone(updateUser.getPhone());
            response.setPassword(updateUser.getPassword());

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
    public List <UserResponseDTO>getfordocument(String document){
        List<User> users = userRepository.findByDocument(document);
        List<UserResponseDTO> response = new ArrayList<>();
        for (User user : users){
            UserResponseDTO responseDTO = new UserResponseDTO();
            responseDTO.setId(user.getId());
            responseDTO.setDocument(user.getDocument());
            responseDTO.setName(user.getName());
            responseDTO.setLastName(user.getLastName());
            responseDTO.setEmail(user.getEmail());
            responseDTO.setPassword(user.getPassword());
            responseDTO.setPhone(user.getPhone());

            RoleResponseDTO role= new RoleResponseDTO();
            role.setId(user.getId());
            role.setNameRole(user.getRole().getNameRole());
            responseDTO.setRole(role);
            response.add(responseDTO);
        }
        return response;

    }

    //endpoint para actualizar por documento

    public Optional<UserResponseDTO> updateUserForDocument(String document, UserRequestDTO userRequestDTO) {
        List<User> users = userRepository.findByDocument(document);

        if (users.isEmpty()) {
            return Optional.empty();
        }

        User user = users.get(0);
        user.setDocument(userRequestDTO.getDocument());
        user.setName(userRequestDTO.getName());
        user.setLastName(userRequestDTO.getLastName());
        user.setEmail(userRequestDTO.getEmail());
        user.setPhone(userRequestDTO.getPhone());
        user.setPassword(userRequestDTO.getPassword());

        User updatedUser = userRepository.save(user);

        UserResponseDTO response = new UserResponseDTO();
        response.setDocument(updatedUser.getDocument());
        response.setName(updatedUser.getName());
        response.setLastName(updatedUser.getLastName());
        response.setEmail(updatedUser.getEmail());
        response.setPassword(updatedUser.getPassword());
        response.setPhone(updatedUser.getPhone());

        return Optional.of(response);
    }

    // enpoint para eliminar un usuario por el documento

    public  boolean deleteUserdoc(String document){
        List<User> users = userRepository.findByDocument(document);
        if(!users.isEmpty()){
            userRepository.delete(users.get(0));
            return true;
        }
        return false;
    }
}

