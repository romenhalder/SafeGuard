package com.safeguard.admin.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;

@Configuration
public class UserDetailsServiceConfig {

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> User.withUsername(username)
                .password("")
                .roles("ADMIN")
                .build();
    }
}