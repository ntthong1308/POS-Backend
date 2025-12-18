package com.retail.application.service.file;

import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

/**
 * Service để xử lý lưu trữ file upload
 */
public interface FileStorageService {

    /**
     * Lưu file và trả về URL để truy cập file
     * @param file File cần upload
     * @param subDirectory Thư mục con (ví dụ: "products", "customers")
     * @return URL để truy cập file (ví dụ: "/uploads/products/abc123.jpg")
     */
    String storeFile(MultipartFile file, String subDirectory);

    /**
     * Xóa file
     * @param fileUrl URL của file cần xóa
     */
    void deleteFile(String fileUrl);

    /**
     * Lấy đường dẫn file từ URL
     * @param fileUrl URL của file
     * @return Path của file trong hệ thống
     */
    Path getFilePath(String fileUrl);

    /**
     * Kiểm tra file có tồn tại không
     * @param fileUrl URL của file
     * @return true nếu file tồn tại
     */
    boolean fileExists(String fileUrl);
}

