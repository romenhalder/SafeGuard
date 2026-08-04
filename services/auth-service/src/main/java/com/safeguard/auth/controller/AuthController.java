package com.safeguard.auth.controller;

import com.safeguard.auth.dto.request.LoginRequest;
import com.safeguard.auth.dto.request.RefreshTokenRequest;
import com.safeguard.auth.dto.request.RegisterRequest;
import com.safeguard.auth.dto.response.AuthResponse;
import com.safeguard.auth.service.AuthService;
import com.safeguard.common.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/citizen/register")
    public ResponseEntity<ApiResponse<AuthResponse>> registerCitizen(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerCitizen(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/citizen/login")
    public ResponseEntity<ApiResponse<AuthResponse>> loginCitizen(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.loginCitizen(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/officer/login")
    public ResponseEntity<ApiResponse<AuthResponse>> loginOfficer(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.loginOfficer(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<ApiResponse<AuthResponse>> loginAdmin(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.loginAdmin(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(Authentication authentication) {
        if (authentication != null) {
            authService.logout(authentication.getName());
        }
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }
}
