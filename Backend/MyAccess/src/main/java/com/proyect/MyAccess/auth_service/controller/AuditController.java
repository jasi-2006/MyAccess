package com.proyect.MyAccess.auth_service.controller;
import com.proyect.MyAccess.auth_service.dto.AuditRequestDTO;
import com.proyect.MyAccess.auth_service.dto.AuditResponseDTO;
import com.proyect.MyAccess.auth_service.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/register")
public class AuditController {

	private final AuditService auditService;

	@PostMapping("/audit")
	public ResponseEntity<AuditResponseDTO> created(@RequestBody AuditRequestDTO RequestDTO) {
		AuditResponseDTO response = auditService.Created (RequestDTO);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}



}
