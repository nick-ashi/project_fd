package com.finance.ashipfd.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * CORS config
 *
 * Allows frontend to call sb backend
 *
 * WHY THO?
 * - Frontend and backend are on different ports
 * - Browser blocks cross-origin requests by default (security)
 * - We EXPLICITLY allow localhost (for now) to make requests
 *
 * WHAT IT DO:
 * - Allows reqs from localhost
 * - Allows the usual HTTP methods (GET, POST, PUT, DELETE)
 * - Allows auth header (for JWT token)
 * - Allows credds (cookies, auth headers)
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow requests from React frontend
        String allowedOrigins = System.getenv().getOrDefault("CORS_ALLOWED_ORIGINS", "http://localhost:5173");
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));

        // Allow common HTTP methods
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Allow all headers (including auth for JWT)
        config.setAllowedHeaders(Arrays.asList("*"));

        // (cookies, auth headers)
        config.setAllowCredentials(true);

        // Apply CORS configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}