package com.retail.bootstrap.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Cấu hình để serve static files từ thư mục uploads
 * Order = 1 để đảm bảo resource handler không conflict với REST controllers
 */
@Configuration
@Order(1)
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Note: File serving được xử lý bởi FileServeController
        // Resource handler này chỉ dùng làm fallback nếu cần
        // Controller sẽ được ưu tiên hơn resource handler
    }
}
