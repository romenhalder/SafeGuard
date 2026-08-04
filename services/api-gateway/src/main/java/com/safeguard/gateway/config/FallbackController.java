package com.safeguard.gateway.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class FallbackController {

    @GetMapping("/fallback/auth")
    public ResponseEntity<Map<String, String>> authFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("status", "ERROR", "message", "Auth service is temporarily unavailable. Please try again."));
    }

    @GetMapping("/fallback/user")
    public ResponseEntity<Map<String, String>> userFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("status", "ERROR", "message", "User service is temporarily unavailable."));
    }

    @GetMapping("/fallback/alert")
    public ResponseEntity<Map<String, String>> alertFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("status", "ERROR", "message", "Alert service is temporarily unavailable."));
    }

    @GetMapping("/fallback/location")
    public ResponseEntity<Map<String, String>> locationFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("status", "ERROR", "message", "Location service is temporarily unavailable."));
    }

    @GetMapping("/fallback/incident")
    public ResponseEntity<Map<String, String>> incidentFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("status", "ERROR", "message", "Incident service is temporarily unavailable."));
    }

    @GetMapping("/fallback/admin")
    public ResponseEntity<Map<String, String>> adminFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("status", "ERROR", "message", "Admin service is temporarily unavailable."));
    }
}
