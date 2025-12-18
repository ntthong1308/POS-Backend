package com.retail.bootstrap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {
        "com.retail.bootstrap",
        "com.retail.api",
        "com.retail.pos",
        "com.retail.admin",
        "com.retail.application",
        "com.retail.security"
})
@EntityScan(basePackages = "com.retail.domain")
@EnableJpaRepositories(basePackages = "com.retail.persistence.repository")
@EnableJpaAuditing
public class RetailPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(RetailPlatformApplication.class, args);
    }
}