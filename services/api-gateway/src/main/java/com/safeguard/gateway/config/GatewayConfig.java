package com.safeguard.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRoutes(RouteLocatorBuilder builder) {
        return builder.routes()

                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .filters(f -> f
                                .stripPrefix(0)
                                .circuitBreaker(config -> config
                                        .setName("authCB")
                                        .setFallbackUri("forward:/fallback/auth")))
                        .uri("lb://auth-service"))

                .route("user-service", r -> r
                        .path("/api/citizen/**", "/api/officer/**")
                        .filters(f -> f
                                .stripPrefix(0)
                                .circuitBreaker(config -> config
                                        .setName("userCB")
                                        .setFallbackUri("forward:/fallback/user")))
                        .uri("lb://user-service"))

                .route("alert-service", r -> r
                        .path("/api/sos/**")
                        .filters(f -> f
                                .stripPrefix(0)
                                .circuitBreaker(config -> config
                                        .setName("alertCB")
                                        .setFallbackUri("forward:/fallback/alert")))
                        .uri("lb://alert-service"))

                .route("location-service", r -> r
                        .path("/api/location/**")
                        .filters(f -> f
                                .stripPrefix(0)
                                .circuitBreaker(config -> config
                                        .setName("locationCB")
                                        .setFallbackUri("forward:/fallback/location")))
                        .uri("lb://location-service"))

                .route("incident-service", r -> r
                        .path("/api/incidents/**")
                        .filters(f -> f
                                .stripPrefix(0)
                                .circuitBreaker(config -> config
                                        .setName("incidentCB")
                                        .setFallbackUri("forward:/fallback/incident")))
                        .uri("lb://incident-service"))

                .route("admin-service", r -> r
                        .path("/api/admin/**")
                        .filters(f -> f
                                .stripPrefix(0)
                                .circuitBreaker(config -> config
                                        .setName("adminCB")
                                        .setFallbackUri("forward:/fallback/admin")))
                        .uri("lb://admin-service"))

                .route("analytics-service", r -> r
                        .path("/api/analytics/**")
                        .filters(f -> f
                                .stripPrefix(0))
                        .uri("lb://analytics-service"))

                .route("notification-ws", r -> r
                        .path("/ws/**")
                        .uri("lb:ws://notification-service"))

                .build();
    }
}
