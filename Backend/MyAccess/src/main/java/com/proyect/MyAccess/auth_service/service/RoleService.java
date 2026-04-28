package com.proyect.MyAccess.auth_service.service;

import com.proyect.MyAccess.auth_service.dto.RoleRequestDTO;
import com.proyect.MyAccess.auth_service.dto.RoleResponseDTO;
import com.proyect.MyAccess.auth_service.entity.Role;
import com.proyect.MyAccess.auth_service.repository.RoleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/*
 * Servicio para gestionar los roles del sistema.
 * Permite crear, consultar, actualizar y eliminar roles de usuario.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;

    /*
     * Crea y persiste un nuevo rol en el sistema.
     * @param dto Datos del rol a crear
     * @return RoleResponseDTO con los datos del rol creado
     */
    public RoleResponseDTO create(RoleRequestDTO dto) {
        Role role = new Role();
        role.setNameRole(dto.getNameRole());
        role.setDescription(dto.getDescription());
        role.setDateCreation(dto.getDateCreation());
        roleRepository.save(role);
        return toResponse(role);
    }

    /*
     * Retorna todos los roles registrados en el sistema.
     * @return Lista de RoleResponseDTO con todos los roles
     */
    public List<RoleResponseDTO> getAll() {
        List<RoleResponseDTO> list = new ArrayList<>();
        for (Role role : roleRepository.findAll()) {
            list.add(toResponse(role));
        }
        return list;
    }

    /*
     * Actualiza los datos de un rol existente por su ID.
     * @param id Identificador del rol a actualizar
     * @param dto Nuevos datos del rol
     * @return Optional con el RoleResponseDTO actualizado, vacío si no existe
     */
    public Optional<RoleResponseDTO> update(Long id, RoleRequestDTO dto) {
        return roleRepository.findById(id).map(role -> {
            role.setNameRole(dto.getNameRole());
            role.setDescription(dto.getDescription());
            role.setDateCreation(dto.getDateCreation());
            return toResponse(roleRepository.save(role));
        });
    }

    /*
     * Elimina un rol por su ID.
     * @param id Identificador del rol a eliminar
     * @return true si fue eliminado, false si no existía
     */
    public boolean delete(Long id) {
        if (roleRepository.existsById(id)) {
            roleRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /*
     * Convierte una entidad Role en su DTO de respuesta.
     * @param role Entidad de rol a convertir
     * @return RoleResponseDTO con los datos mapeados
     */
    private RoleResponseDTO toResponse(Role role) {
        RoleResponseDTO r = new RoleResponseDTO();
        r.setId(role.getId());
        r.setNameRole(role.getNameRole());
        r.setDescription(role.getDescription());
        r.setDateCreation(role.getDateCreation());
        return r;
    }
}
