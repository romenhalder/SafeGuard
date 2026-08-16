package com.safeguard.gateway.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class FallbackController {

    @RequestMapping("/fallback/auth")
    public ResponseEntity<Map<String, String>> authFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("status", "ERROR", "message", "Auth service is temporarily unavailable. Please try again."));
    }

    @RequestMapping("/fallback/user")
    public ResponseEntity<Map<String, String>> userFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("status", "ERROR", "message", "User service is temporarily unavailable."));
    }

    @RequestMapping("/fallback/alert")
    public ResponseEntity<Map<String, String>> alertFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("status", "ERROR", "message", "Alert service is temporarily unavailable."));
    }

    @RequestMapping("/fallback/location")
    public ResponseEntity<Map<String, String>> locationFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("status", "ERROR", "message", "Location service is temporarily unavailable."));
    }

    @RequestMapping("/fallback/incident")
    public ResponseEntity<Map<String, String>> incidentFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("status", "ERROR", "message", "Incident service is temporarily unavailable."));
    }

    @RequestMapping("/fallback/admin")
    public ResponseEntity<Map<String, String>> adminFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("status", "ERROR", "message", "Admin service is temporarily unavailable."));
    }
}
