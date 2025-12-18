package com.retail.application.service.file;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Implementation của FileStorageService
 * Lưu file vào thư mục local trên server
 */
@Service
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageServiceImpl(@Value("${app.file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("File storage location initialized: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String subDirectory) {
        // Validate file
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        // Validate file name
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        if (originalFilename.contains("..")) {
            throw new IllegalArgumentException("Sorry! Filename contains invalid path sequence " + originalFilename);
        }

        // Validate file type (chỉ cho phép images)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed. Received: " + (contentType != null ? contentType : "null"));
        }

        try {
            // Tạo thư mục con nếu chưa có
            Path targetDirectory = this.fileStorageLocation.resolve(subDirectory);
            Files.createDirectories(targetDirectory);

            // Tạo tên file unique (UUID + extension)
            String fileExtension = "";
            int lastDotIndex = originalFilename.lastIndexOf('.');
            if (lastDotIndex > 0) {
                fileExtension = originalFilename.substring(lastDotIndex);
            }
            
            String fileName = UUID.randomUUID().toString() + fileExtension;
            Path targetLocation = targetDirectory.resolve(fileName);

            // Copy file vào thư mục
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Tạo URL để trả về (relative path)
            String fileUrl = "/uploads/" + subDirectory + "/" + fileName;
            
            log.info("File stored successfully: {} -> {}", originalFilename, fileUrl);
            return fileUrl;

        } catch (IOException ex) {
            log.error("Could not store file: {}", originalFilename, ex);
            throw new RuntimeException("Could not store file " + originalFilename + ". Please try again!", ex);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        try {
            Path filePath = getFilePath(fileUrl);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted successfully: {}", fileUrl);
            } else {
                log.warn("File not found for deletion: {}", fileUrl);
            }
        } catch (IOException ex) {
            log.error("Could not delete file: {}", fileUrl, ex);
            throw new RuntimeException("Could not delete file " + fileUrl, ex);
        }
    }

    @Override
    public Path getFilePath(String fileUrl) {
        // Remove leading slash if present
        String relativePath = fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl;
        return this.fileStorageLocation.resolve(relativePath).normalize();
    }

    @Override
    public boolean fileExists(String fileUrl) {
        try {
            Path filePath = getFilePath(fileUrl);
            return Files.exists(filePath);
        } catch (Exception ex) {
            log.error("Error checking file existence: {}", fileUrl, ex);
            return false;
        }
    }
}

