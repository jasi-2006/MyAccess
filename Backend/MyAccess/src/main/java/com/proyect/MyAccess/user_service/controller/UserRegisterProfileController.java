package com.proyect.MyAccess.user_service.controller;
import com.proyect.MyAccess.user_service.dto.UpdatePasswordRequestDTO;
import com.proyect.MyAccess.user_service.dto.UserRegisterProfileRequestDTO;
import com.proyect.MyAccess.user_service.dto.UserRegisterProfileResponseDTO;
import com.proyect.MyAccess.user_service.service.UserRegisterProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;


import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/register")
public class UserRegisterProfileController {

	private final UserRegisterProfileService userService;

	@PostMapping("/users")
	public ResponseEntity<UserRegisterProfileResponseDTO> created(@RequestBody UserRegisterProfileRequestDTO userRequestDTO) {
		UserRegisterProfileResponseDTO response = userService.userCreated(userRequestDTO);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping
	public ResponseEntity<List<UserRegisterProfileResponseDTO>> traerUsuarios() {
		List<UserRegisterProfileResponseDTO> response = userService.getUsuarios();
		return ResponseEntity.status(HttpStatus.OK).body(response);
	}

	@GetMapping("/role/{nameRole}")
	public ResponseEntity<List<UserRegisterProfileResponseDTO>> getUserForRole(@PathVariable String nameRole) {
		List<UserRegisterProfileResponseDTO> response = userService.getForNameRol(nameRole);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/users/{document}")
	public ResponseEntity<List<UserRegisterProfileResponseDTO>> getUserForDocument(@PathVariable String document) {
		List<UserRegisterProfileResponseDTO> response = userService.getForDocument(document);
		return ResponseEntity.ok(response);
	}

	@PutMapping("/users/{id}")
	public ResponseEntity<UserRegisterProfileResponseDTO> updateUser( @PathVariable Long id, @RequestBody UserRegisterProfileRequestDTO userRequestDTO, HttpServletRequest request) {
		String role = (String) request.getAttribute("role");
		if(!"ADMIN".equalsIgnoreCase(role)){
			return  ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}
		Optional<UserRegisterProfileResponseDTO> response = userService.updateUser(id, userRequestDTO);
		return response.map(r -> ResponseEntity.status(HttpStatus.ACCEPTED).body(r))
				.orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
	}

	@PutMapping("/users/document/{document}")
	public ResponseEntity<UserRegisterProfileResponseDTO> updateUserForDocument(
			@PathVariable String document,
			@RequestBody UserRegisterProfileRequestDTO userRequestDTO, HttpServletRequest request) {
		String role = (String) request.getAttribute("role");
		Long userId = (Long) request.getAttribute("userId");
		if ("APRENDIZ".equalsIgnoreCase(role)) {
			List<UserRegisterProfileResponseDTO> user = userService.getForDocument(document);
			if (user.isEmpty() || !user.get(0).getId().equals(userId)) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
			}
		}
		Optional<UserRegisterProfileResponseDTO>response= userService.updateUserForDocument(document, userRequestDTO);
		return response.map(r->ResponseEntity.status(HttpStatus.ACCEPTED).body(r))
				.orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
	}
	@PatchMapping("/user/password")
	public ResponseEntity<?> updatePassword(@RequestBody UpdatePasswordRequestDTO dto) {
		userService.updatePassword(dto);
		return ResponseEntity.ok("Contraseña actualizada correctamente");
	}

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
