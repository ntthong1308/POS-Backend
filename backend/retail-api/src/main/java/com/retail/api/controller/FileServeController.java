package com.retail.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Controller để serve static files từ thư mục uploads
 * Hỗ trợ cả /uploads/** và /api/v1/uploads/** để tương thích với frontend
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class FileServeController {

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    /**
     * Serve file từ /uploads/**
     * Example: /uploads/products/abc.jpg
     */
    @GetMapping("/uploads/**")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
        return serveFileInternal(request);
    }

    /**
     * Serve file từ /api/v1/uploads/**
     * Example: /api/v1/uploads/products/abc.jpg
     */
    @GetMapping("/api/v1/uploads/**")
    public ResponseEntity<Resource> serveFileFromApi(HttpServletRequest request) {
        return serveFileInternal(request);
    }

    private ResponseEntity<Resource> serveFileInternal(HttpServletRequest request) {
        try {
            // Lấy path từ request URI
            String requestPath = request.getRequestURI();
            
            // Strip prefix để lấy relative path
            String relativePath = requestPath
                    .replaceFirst("^/api/v1/uploads/", "")
                    .replaceFirst("^/uploads/", "");
            
            // Build file path - đảm bảo cả 2 đều là absolute path
            Path uploadDirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = uploadDirPath.resolve(relativePath).normalize();
            
            // Security check: đảm bảo file nằm trong uploadDir
            if (!filePath.startsWith(uploadDirPath)) {
                log.warn("Attempted access outside upload directory: {} (uploadDir: {})", filePath, uploadDirPath);
                return ResponseEntity.notFound().build();
            }
            
            // Kiểm tra file tồn tại
            if (!Files.exists(filePath) || !Files.isRegularFile(filePath)) {
                log.warn("File not found: {}", filePath);
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new FileSystemResource(filePath);
            
            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            log.debug("Serving file: {} (content-type: {})", filePath, contentType);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filePath.getFileName() + "\"")
                    .body(resource);
                    
        } catch (Exception e) {
            log.error("Error serving file: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}

