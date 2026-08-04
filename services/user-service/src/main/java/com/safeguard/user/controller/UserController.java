package com.safeguard.user.controller;

import com.safeguard.common.util.ApiResponse;
import com.safeguard.user.entity.Citizen;
import com.safeguard.user.entity.Officer;
import com.safeguard.user.entity.PatrolZone;
import com.safeguard.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/citizen/{id}")
    public ResponseEntity<ApiResponse<Citizen>> getCitizen(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getCitizen(id)));
    }

    @PutMapping("/citizen/{id}")
    public ResponseEntity<ApiResponse<Citizen>> updateCitizen(@PathVariable UUID id, @RequestBody Citizen updates) {
        return ResponseEntity.ok(ApiResponse.success("Updated", userService.updateCitizen(id, updates)));
    }

    @GetMapping("/admin/officers")
    public ResponseEntity<ApiResponse<Page<Officer>>> getAllOfficers(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllOfficers(pageable)));
    }

    @GetMapping("/admin/officers/{id}")
    public ResponseEntity<ApiResponse<Officer>> getOfficer(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getOfficer(id)));
    }

    @GetMapping("/officer/nearby")
    public ResponseEntity<ApiResponse<List<Officer>>> getNearbyOfficers(
            @RequestParam double lat, @RequestParam double lng,
            @RequestParam(defaultValue = "3000") double radius) {
        return ResponseEntity.ok(ApiResponse.success(userService.getNearbyOfficers(lat, lng, radius)));
    }

    @GetMapping("/officer/duty/on")
    public ResponseEntity<ApiResponse<List<Officer>>> getOnDutyOfficers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getOnDutyOfficers()));
    }

    @PutMapping("/officer/{id}/duty-status")
    public ResponseEntity<ApiResponse<Officer>> updateDutyStatus(
            @PathVariable UUID id, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", userService.updateDutyStatus(id, status)));
    }

    @GetMapping("/admin/zones")
    public ResponseEntity<ApiResponse<Page<PatrolZone>>> getAllZones(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllZones(pageable)));
    }

    @PostMapping("/admin/zones")
    public ResponseEntity<ApiResponse<PatrolZone>> createZone(@RequestBody PatrolZone zone) {
        return ResponseEntity.ok(ApiResponse.success("Zone created", userService.createZone(zone)));
    }

    @PutMapping("/admin/zones/{id}")
    public ResponseEntity<ApiResponse<PatrolZone>> updateZone(@PathVariable UUID id, @RequestBody PatrolZone updates) {
        return ResponseEntity.ok(ApiResponse.success("Zone updated", userService.updateZone(id, updates)));
    }
}
