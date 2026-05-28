package com.proyect.user_service.controller;

import com.proyect.user_service.service.UserRegisterProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@RestController
@RequiredArgsConstructor
public class PhotoUploadController {

    private final UserRegisterProfileService userRegisterProfileService;

    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<byte[]> getUploadedPhoto(@PathVariable String filename) throws IOException {
        return userRegisterProfileService.loadPhotoBytes(filename)
                .map(bytes -> {
                    String contentType = userRegisterProfileService
                            .loadPhotoContentType(filename)
                            .orElse(MediaType.IMAGE_JPEG_VALUE);
                    return ResponseEntity.ok()
                            .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                            .contentType(MediaType.parseMediaType(contentType))
                            .body(bytes);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
