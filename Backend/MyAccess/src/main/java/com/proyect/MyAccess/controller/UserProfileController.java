package com.proyect.MyAccess.controller;
import com.proyect.MyAccess.dto.UserProfileRequestDTO;
import com.proyect.MyAccess.dto.UserProfileResponseDTO;
import com.proyect.MyAccess.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserProfileController {
	private final UserProfileService userService;

	// endpoint para registrar usuarios

	
	@PostMapping("/users")
	public ResponseEntity<UserProfileRequestDTO> created(@RequestBody UserProfileRequestDTO userRequestDTO) {
		UserProfileRequestDTO response = userService.userCreated(userRequestDTO);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	// enpoint para listar todos los usuarios registrados
	@GetMapping
	public ResponseEntity<List<UserProfileResponseDTO>>traerUsuarios(){
		List <UserProfileResponseDTO> response =userService.getUsuarios();
		return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
	}

	// enpoint para traer los datos mediante el rol
	@GetMapping("/role/{nameRole}")
	public ResponseEntity<List<UserProfileResponseDTO>> getUserforRole(@PathVariable String nameRole){
		List<UserProfileResponseDTO>response = userService.getForNameRol(nameRole);
		return ResponseEntity.ok(response);
	}

	// enpoint para traer los datos mediante el documento
	@GetMapping("/users/{document}")
	public ResponseEntity<List<UserProfileResponseDTO>> getUserfordocument(@PathVariable String document){
		List<UserProfileResponseDTO>response =userService.getfordocument(document);
		return  ResponseEntity.ok(response);
	}
	// endpoint para editar los usuarios registrados

	@PutMapping("/users/{id}")
	public ResponseEntity <UserProfileResponseDTO>updateUser(@PathVariable Long id, @RequestBody UserProfileRequestDTO userRequestDTO ){
		UserProfileResponseDTO response = userService.updateUser(id,new UserProfileResponseDTO()).orElse (null);
		if (response!=null){
			return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
		}else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
		}
	}

	@DeleteMapping("users/{id}")
	public  ResponseEntity<?> deleteUser(@PathVariable Long id){
		boolean delete = userService.deleteUserid(id);
		if (delete){
			return  ResponseEntity.status(HttpStatus.OK).body(delete);
		}else  {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
	}

	// actualizar con documento
	@PutMapping("/users/document/{document}")
	public ResponseEntity<UserProfileResponseDTO> updateUserfordocument(@PathVariable String document,@RequestBody UserProfileRequestDTO userRequestDTO) {
		Optional<UserProfileResponseDTO> response = userService.updateUserForDocument(document, userRequestDTO);
		if (response.isPresent()) {
			return ResponseEntity.status(HttpStatus.ACCEPTED).body(response.get());
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
	}

	@DeleteMapping("/users/delete/{document}")
	public ResponseEntity<?> delete (@PathVariable String document){
		boolean deleted = userService.deleteUserdoc(document);
		if (deleted){
			return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
		}else{
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
	}

}


