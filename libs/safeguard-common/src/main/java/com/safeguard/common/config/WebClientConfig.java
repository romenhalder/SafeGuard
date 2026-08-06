package com.safeguard.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class WebClientConfig {

    /**
     * RestClient builder for inter-service HTTP calls.
     * Uses Spring MVC RestClient (Spring 6+) replacing the previous WebFlux WebClient.
     */
    @Bean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }
}