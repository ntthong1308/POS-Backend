package com.retail.security.config;

import com.retail.security.jwt.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Cấu hình Security với JWT Authentication - Xác định các endpoint công khai và yêu cầu xác thực
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ⭐ PUBLIC ENDPOINTS - NO AUTHENTICATION REQUIRED
                        .requestMatchers("/api/auth/**").permitAll()           // ← THÊM: Login/Register (without /v1/)
                        .requestMatchers("/api/v1/auth/**").permitAll()        // Auth endpoints (with /v1/)
                        .requestMatchers("/api/v1/payments/vnpay/**").permitAll() // VNPay callbacks (return & IPN) - PUBLIC
                        .requestMatchers("/api/v1/files/**").permitAll()        // File upload endpoints
                        .requestMatchers("/uploads/**").permitAll()            // Static file serving
                        .requestMatchers("/api/v1/uploads/**").permitAll()     // Static file serving (alternative path)
                        .requestMatchers("/api/products/**").permitAll()       // Product API (for cache testing - TEMPORARY)
                        .requestMatchers("/api/customers/**").permitAll()      // Customer API (for cache testing - TEMPORARY)
                        .requestMatchers("/api/invoices/**").permitAll()       // Invoice PDF generation
                        .requestMatchers("/api/reports/**").permitAll()        // Excel reports (Day 3-4)
                        .requestMatchers("/actuator/**").permitAll()           // Health checks
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                        // ⭐ POS ENDPOINTS - CASHIER, MANAGER, ADMIN
                        .requestMatchers("/api/v1/pos/**").hasAnyRole("CASHIER", "MANAGER", "ADMIN")

                        // ⭐ ADMIN ENDPOINTS - ADMIN, MANAGER
                        .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "MANAGER")

                        // ⭐ ANY OTHER REQUEST NEEDS AUTHENTICATION
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",   // React (Create React App)
                "http://localhost:4200",   // Angular
                "http://localhost:5173"    // Vite (React/Vue)
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}