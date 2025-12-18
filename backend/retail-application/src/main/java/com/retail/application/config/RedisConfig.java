package com.retail.application.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.support.NoOpCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

/**
 * Cấu hình Redis cho caching - Quản lý kết nối, cache manager và serialization
 */
@Configuration
@EnableCaching
@Slf4j
public class RedisConfig {

    /**
     * Cấu hình RedisTemplate cho các thao tác Redis thủ công
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Use String serializer for keys
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);

        // Use JSON serializer for values
        GenericJackson2JsonRedisSerializer jsonSerializer = createJsonSerializer();
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();

        log.info("RedisTemplate configured successfully");
        return template;
    }

    /**
     * Configure RedisCacheManager with default TTL and error handling
     * Falls back to NoOpCacheManager if Redis is not available
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        try {
            // Test Redis connection first
            connectionFactory.getConnection().ping();
            log.info("Redis connection available - Using RedisCacheManager");

            // Default cache configuration
            RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(30)) // Default TTL: 30 minutes
                    .serializeKeysWith(
                            RedisSerializationContext.SerializationPair.fromSerializer(
                                    new StringRedisSerializer()
                            )
                    )
                    .serializeValuesWith(
                            RedisSerializationContext.SerializationPair.fromSerializer(
                                    createJsonSerializer()
                            )
                    )
                    .disableCachingNullValues();

            RedisCacheManager cacheManager = RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(defaultConfig)
                    // Specific cache configurations
                    .withCacheConfiguration("products",
                            defaultConfig.entryTtl(Duration.ofHours(1))) // Products: 1 hour
                    .withCacheConfiguration("customers",
                            defaultConfig.entryTtl(Duration.ofMinutes(15))) // Customers: 15 minutes
                    .withCacheConfiguration("invoices",
                            defaultConfig.entryTtl(Duration.ofMinutes(10))) // Invoices: 10 minutes
                    .withCacheConfiguration("promotions",
                            defaultConfig.entryTtl(Duration.ofMinutes(15))) // Promotions: 15 minutes
                    .transactionAware()
                    .build();

            log.info("RedisCacheManager configured with custom TTL settings");
            log.info("  - products cache: 1 hour TTL");
            log.info("  - customers cache: 15 minutes TTL");
            log.info("  - invoices cache: 10 minutes TTL");
            log.info("  - promotions cache: 15 minutes TTL");
            log.info("  - default cache: 30 minutes TTL");

            return new ErrorHandlingCacheManager(cacheManager);
        } catch (Exception e) {
            log.warn("Redis connection failed - Cache will be disabled (fallback to NoOpCacheManager)");
            log.warn("Error: {}", e.getMessage());
            log.warn("Application will continue to work but without caching");
            return new NoOpCacheManager();
        }
    }

    /**
     * Error handling wrapper for RedisCacheManager
     * Catches Redis exceptions and logs them without failing the application
     */
    private class ErrorHandlingCacheManager implements CacheManager {
        private final CacheManager delegate;

        public ErrorHandlingCacheManager(CacheManager delegate) {
            this.delegate = delegate;
        }

        @Override
        public Cache getCache(String name) {
            try {
                return delegate.getCache(name);
            } catch (Exception e) {
                log.warn("Error getting cache '{}': {}. Cache operation will be skipped.", name, e.getMessage());
                return null;
            }
        }

        @Override
        public java.util.Collection<String> getCacheNames() {
            try {
                return delegate.getCacheNames();
            } catch (Exception e) {
                log.warn("Error getting cache names: {}. Returning empty list.", e.getMessage());
                return java.util.Collections.emptyList();
            }
        }
    }

    /**
     * Create JSON serializer with Java 8 date/time support
     */
    private GenericJackson2JsonRedisSerializer createJsonSerializer() {
        ObjectMapper objectMapper = new ObjectMapper();

        // Register Java 8 date/time module
        objectMapper.registerModule(new JavaTimeModule());

        // Enable type information for polymorphic deserialization
        objectMapper.activateDefaultTyping(
                BasicPolymorphicTypeValidator.builder()
                        .allowIfBaseType(Object.class)
                        .build(),
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );

        return new GenericJackson2JsonRedisSerializer(objectMapper);
    }
}