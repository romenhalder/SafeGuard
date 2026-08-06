package com.safeguard.auth.service;

import com.safeguard.auth.dto.request.LoginRequest;
import com.safeguard.auth.dto.request.RefreshTokenRequest;
import com.safeguard.auth.dto.request.RegisterRequest;
import com.safeguard.auth.dto.response.AuthResponse;
import com.safeguard.auth.entity.AdminUser;
import com.safeguard.auth.entity.Citizen;
import com.safeguard.auth.entity.Officer;
import com.safeguard.auth.repository.AdminUserRepository;
import com.safeguard.auth.repository.CitizenRepository;
import com.safeguard.auth.repository.OfficerRepository;
import com.safeguard.common.exception.BadRequestException;
import com.safeguard.common.exception.ResourceNotFoundException;
import com.safeguard.common.exception.UnauthorizedException;
import com.safeguard.common.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final CitizenRepository citizenRepository;
    private final OfficerRepository officerRepository;
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String OTP_PREFIX = "safeguard:otp:";
    private static final String REFRESH_PREFIX = "safeguard:refresh:";
    private static final long OTP_EXPIRY_MINUTES = 5;
    private static final long REFRESH_TOKEN_EXPIRY_DAYS = 7;

    @Transactional
    public AuthResponse registerCitizen(RegisterRequest request) {
        if (citizenRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone number already registered");
        }

        Citizen citizen = Citizen.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .verified(false)
                .build();

        citizen = citizenRepository.save(citizen);
        log.info("Citizen registered: {}", citizen.getPhone());

        String accessToken = jwtTokenProvider.generateAccessToken(citizen.getPhone());
        String refreshToken = jwtTokenProvider.generateRefreshToken(citizen.getPhone());

        storeRefreshToken(citizen.getPhone(), refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpiration())
                .userId(citizen.getId().toString())
                .name(citizen.getName())
                .role("CITIZEN")
                .build();
    }

    public AuthResponse loginCitizen(LoginRequest request) {
        Citizen citizen = citizenRepository.findByPhone(request.getIdentifier())
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with phone: " + request.getIdentifier()));

        if (!passwordEncoder.matches(request.getPassword(), citizen.getPasswordHash())) {
            throw new UnauthorizedException("Invalid password");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(citizen.getPhone());
        String refreshToken = jwtTokenProvider.generateRefreshToken(citizen.getPhone());

        storeRefreshToken(citizen.getPhone(), refreshToken);

        log.info("Citizen logged in: {}", citizen.getPhone());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpiration())
                .userId(citizen.getId().toString())
                .name(citizen.getName())
                .role("CITIZEN")
                .build();
    }

    public AuthResponse loginOfficer(LoginRequest request) {
        Officer officer = officerRepository.findByDepartmentId(request.getIdentifier())
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with department ID: " + request.getIdentifier()));

        if (!passwordEncoder.matches(request.getPassword(), officer.getPasswordHash())) {
            throw new UnauthorizedException("Invalid password");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(officer.getDepartmentId());
        String refreshToken = jwtTokenProvider.generateRefreshToken(officer.getDepartmentId());

        storeRefreshToken(officer.getDepartmentId(), refreshToken);

        log.info("Officer logged in: {}", officer.getDepartmentId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpiration())
                .userId(officer.getId().toString())
                .name(officer.getName())
                .role("OFFICER")
                .build();
    }

    public AuthResponse loginAdmin(LoginRequest request) {
        AdminUser admin = adminUserRepository.findByUsername(request.getIdentifier())
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found: " + request.getIdentifier()));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new UnauthorizedException("Invalid password");
        }

        admin.setLastLogin(LocalDateTime.now());
        adminUserRepository.save(admin);

        String accessToken = jwtTokenProvider.generateAccessToken(admin.getUsername());
        String refreshToken = jwtTokenProvider.generateRefreshToken(admin.getUsername());

        storeRefreshToken(admin.getUsername(), refreshToken);

        log.info("Admin logged in: {}", admin.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpiration())
                .userId(admin.getId().toString())
                .name(admin.getUsername())
                .role(admin.getRole())
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(token)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String username = jwtTokenProvider.getUsernameFromToken(token);
        Object stored = redisTemplate.opsForValue().get(REFRESH_PREFIX + username);

        if (stored == null || !stored.equals(token)) {
            throw new UnauthorizedException("Refresh token expired or revoked");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(username);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(username);

        storeRefreshToken(username, newRefreshToken);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpiration())
                .build();
    }

    public void logout(String username) {
        redisTemplate.delete(REFRESH_PREFIX + username);
        log.info("User logged out: {}", username);
    }

    private void storeRefreshToken(String key, String token) {
        redisTemplate.opsForValue().set(REFRESH_PREFIX + key, token, REFRESH_TOKEN_EXPIRY_DAYS, TimeUnit.DAYS);
    }
}
