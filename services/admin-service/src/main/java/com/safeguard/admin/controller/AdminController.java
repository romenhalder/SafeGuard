package com.safeguard.admin.controller;

import com.safeguard.admin.dto.DashboardOverview;
import com.safeguard.admin.entity.Officer;
import com.safeguard.admin.entity.PatrolZone;
import com.safeguard.admin.service.AdminService;
import com.safeguard.common.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard/overview")
    public ResponseEntity<ApiResponse<DashboardOverview>> getDashboardOverview() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardOverview()));
    }

    @GetMapping("/map/officers")
    public ResponseEntity<ApiResponse<List<Officer>>> getAllOfficers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllOfficers()));
    }

    @GetMapping("/map/officers/on-duty")
    public ResponseEntity<ApiResponse<List<Officer>>> getOnDutyOfficers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getOnDutyOfficers()));
    }

    @GetMapping("/officers")
    public ResponseEntity<ApiResponse<List<Officer>>> listOfficers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllOfficers()));
    }

    @GetMapping("/officers/{id}")
    public ResponseEntity<ApiResponse<Officer>> getOfficer(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getOfficer(id)));
    }

    @PostMapping("/officers")
    public ResponseEntity<ApiResponse<Officer>> createOfficer(@RequestBody Officer officer) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Officer created", adminService.createOfficer(officer)));
    }

    @PutMapping("/officers/{id}")
    public ResponseEntity<ApiResponse<Officer>> updateOfficer(@PathVariable UUID id, @RequestBody Officer updates) {
        return ResponseEntity.ok(ApiResponse.success("Officer updated", adminService.updateOfficer(id, updates)));
    }

    @DeleteMapping("/officers/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivateOfficer(@PathVariable UUID id) {
        adminService.deactivateOfficer(id);
        return ResponseEntity.ok(ApiResponse.success("Officer deactivated"));
    }

    @GetMapping("/zones")
    public ResponseEntity<ApiResponse<List<PatrolZone>>> getAllZones() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllZones()));
    }

    @PostMapping("/zones")
    public ResponseEntity<ApiResponse<PatrolZone>> createZone(@RequestBody PatrolZone zone) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Zone created", adminService.createZone(zone)));
    }
}
