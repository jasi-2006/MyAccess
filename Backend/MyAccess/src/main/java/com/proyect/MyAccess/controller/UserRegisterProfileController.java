package com.proyect.MyAccess.controller;
import com.proyect.MyAccess.dto.UserRegisterProfileRequestDTO;
import com.proyect.MyAccess.dto.UserRegisterProfileResponseDTO;
import com.proyect.MyAccess.service.UserRegisterProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/Register")
public class UserRegisterProfileController {

	private final UserRegisterProfileService userService;

	// CREATE - Registrar usuarios
	@PostMapping("/users")
	public ResponseEntity<UserRegisterProfileResponseDTO> created(@RequestBody UserRegisterProfileRequestDTO userRequestDTO) {
		UserRegisterProfileResponseDTO response = userService.userCreated(userRequestDTO);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	// READ ALL - Listar todos los usuarios
	@GetMapping
	public ResponseEntity<List<UserRegisterProfileResponseDTO>> traerUsuarios() {
		List<UserRegisterProfileResponseDTO> response = userService.getUsuarios();
		return ResponseEntity.status(HttpStatus.OK).body(response);
	}

	// READ BY ROLE - Buscar por rol
	@GetMapping("/role/{nameRole}")
	public ResponseEntity<List<UserRegisterProfileResponseDTO>> getUserForRole(@PathVariable String nameRole) {
		List<UserRegisterProfileResponseDTO> response = userService.getForNameRol(nameRole);
		return ResponseEntity.ok(response);
	}

	// READ BY DOCUMENT - Buscar por documento
	@GetMapping("/users/{document}")
	public ResponseEntity<List<UserRegisterProfileResponseDTO>> getUserForDocument(@PathVariable String document) {
		List<UserRegisterProfileResponseDTO> response = userService.getForDocument(document);
		return ResponseEntity.ok(response);
	}

	// UPDATE BY ID - Actualizar por ID
	@PutMapping("/users/{id}")
	public ResponseEntity<UserRegisterProfileResponseDTO> updateUser(
			@PathVariable Long id,
			@RequestBody UserRegisterProfileRequestDTO userRequestDTO) {

		Optional<UserRegisterProfileResponseDTO> response = userService.updateUser(id, userRequestDTO);

		if (response.isPresent()) {
			return ResponseEntity.status(HttpStatus.ACCEPTED).body(response.get());
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
	}

	// UPDATE BY DOCUMENT - Actualizar por documento
	@PutMapping("/users/document/{document}")
	public ResponseEntity<UserRegisterProfileResponseDTO> updateUserForDocument(
			@PathVariable String document,
			@RequestBody UserRegisterProfileRequestDTO userRequestDTO) {

		Optional<UserRegisterProfileResponseDTO> response = userService.updateUserForDocument(document, userRequestDTO);

		if (response.isPresent()) {
			return ResponseEntity.status(HttpStatus.ACCEPTED).body(response.get());
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
	}

	// DELETE - Eliminar por documento
	@DeleteMapping("/users/delete/{document}")
	public ResponseEntity<?> deleteByDocument(@PathVariable String document) {
		boolean deleted = userService.deleteUserDoc(document);

		if (deleted) {
			return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
	}
}