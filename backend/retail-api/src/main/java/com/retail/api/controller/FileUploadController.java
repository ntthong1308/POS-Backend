package com.retail.api.controller;

import com.retail.application.service.file.FileStorageService;
import com.retail.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controller để xử lý upload file (hình ảnh sản phẩm, etc.)
 */
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    // Log khi bean được tạo (sử dụng @PostConstruct)
    @jakarta.annotation.PostConstruct
    public void init() {
        log.info("FileUploadController initialized successfully");
    }

    /**
     * Upload hình ảnh sản phẩm
     * @param file File hình ảnh cần upload
     * @return URL của file đã upload
     */
    @PostMapping("/products/upload")
    public ResponseEntity<ApiResponse<String>> uploadProductImage(
            @RequestParam("file") MultipartFile file) {
        
        log.info("Uploading product image: {}", file.getOriginalFilename());
        
        try {
            String fileUrl = fileStorageService.storeFile(file, "products");
            log.info("Product image uploaded successfully: {}", fileUrl);
            return ResponseEntity.ok(ApiResponse.success(fileUrl));
        } catch (IllegalArgumentException e) {
            log.error("Invalid file: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_FILE", e.getMessage()));
        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("UPLOAD_FAILED", "Failed to upload file: " + e.getMessage()));
        }
    }

    /**
     * Upload hình ảnh khách hàng
     * @param file File hình ảnh cần upload
     * @return URL của file đã upload
     */
    @PostMapping("/customers/upload")
    public ResponseEntity<ApiResponse<String>> uploadCustomerImage(
            @RequestParam("file") MultipartFile file) {
        
        log.info("Uploading customer image: {}", file.getOriginalFilename());
        
        try {
            String fileUrl = fileStorageService.storeFile(file, "customers");
            log.info("Customer image uploaded successfully: {}", fileUrl);
            return ResponseEntity.ok(ApiResponse.success(fileUrl));
        } catch (IllegalArgumentException e) {
            log.error("Invalid file: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_FILE", e.getMessage()));
        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("UPLOAD_FAILED", "Failed to upload file: " + e.getMessage()));
        }
    }

    /**
     * Xóa file
     * @param fileUrl URL của file cần xóa
     * @return Success message
     */
    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<String>> deleteFile(@RequestParam String fileUrl) {
        log.info("Deleting file: {}", fileUrl);
        
        try {
            fileStorageService.deleteFile(fileUrl);
            return ResponseEntity.ok(ApiResponse.success("File deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting file: {}", fileUrl, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("DELETE_FAILED", "Failed to delete file: " + e.getMessage()));
        }
    }
}

