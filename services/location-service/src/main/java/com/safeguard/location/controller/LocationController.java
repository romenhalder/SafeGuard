package com.safeguard.location.controller;

import com.safeguard.common.dto.location.LocationUpdateRequest;
import com.safeguard.common.util.ApiResponse;
import com.safeguard.location.entity.OfficerLocation;
import com.safeguard.location.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<Void>> updateLocation(
            @RequestHeader("X-User-Id") UUID officerId,
            @Valid @RequestBody LocationUpdateRequest request) {
        locationService.updateOfficerLocation(officerId, request.getLatitude(), request.getLongitude());
        return ResponseEntity.ok(ApiResponse.success("Location updated"));
    }

    @GetMapping("/officer/{officerId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOfficerLocation(@PathVariable UUID officerId) {
        return ResponseEntity.ok(ApiResponse.success(locationService.getOfficerCurrentLocation(officerId)));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<OfficerLocation>>> getAllLocations() {
        return ResponseEntity.ok(ApiResponse.success(locationService.getAllLatestLocations()));
    }
}
