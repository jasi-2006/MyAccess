package com.proyect.MyAccess.controller;
import com.proyect.MyAccess.dto.UserRequestDTO;
import com.proyect.MyAccess.dto.UserResponseDTO;
import com.proyect.MyAccess.entity.User;
import com.proyect.MyAccess.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
	private final UserService userService;

	// endpoint para registrar usuarios

	
	@PostMapping("/users")
	public ResponseEntity<UserResponseDTO> created(@RequestBody UserRequestDTO userRequestDTO) {
		UserResponseDTO response = userService.userCreated(userRequestDTO);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	// enpoint para listar todos los usuarios registrados
	@GetMapping
	public ResponseEntity<List<UserResponseDTO>>traerUsuarios(){
		List <UserResponseDTO> response =userService.getUsuarios();
		return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
	}

	// enpoint para traer los datos mediante el rol
	@GetMapping("/role/{nameRole}")
	public ResponseEntity<List<UserResponseDTO>> getUserforRole(@PathVariable String nameRole){
		List<UserResponseDTO>response = userService.getForNameRol(nameRole);
		return ResponseEntity.ok(response);
	}

	// enpoint para traer los datos mediante el documento
	@GetMapping("/users/{document}")
	public ResponseEntity<List<UserResponseDTO>> getUserfordocument(@PathVariable String document){
		List<UserResponseDTO>response =userService.getfordocument(document);
		return  ResponseEntity.ok(response);
	}
	// endpoint para editar los usuarios registrados

	@PutMapping("/users/{id}")
	public ResponseEntity <UserResponseDTO>updateUser(@PathVariable Long id, @RequestBody UserRequestDTO userRequestDTO ){
		UserResponseDTO response = userService.updateUser(id,userRequestDTO).orElse (null);
		if (response!=null){
			return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
		}else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
		}
	}

	@DeleteMapping("users/{id}")
	public  ResponseEntity<?> deleteUser(@PathVariable Long id){
		boolean delete = userService.deleteUser(id);
		if (delete){
			return  ResponseEntity.status(HttpStatus.OK).body(delete);
		}else  {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
	}
}


